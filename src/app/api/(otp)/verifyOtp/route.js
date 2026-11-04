import { createHash, timingSafeEqual } from "crypto";
import connectDB from "@/lib/db";
import User from "@/models/user/schema";

import { NextResponse } from "next/server";
import { generateToken } from "@/lib/jwt";

const store = globalThis;

export async function POST(request) {
  try {
    const { email, otp } = await request.json();

    // 1. Validate input
    if (
      typeof email !== "string" ||
      typeof otp !== "string" ||
      !/^\d{6}$/.test(otp)
    ) {
      return Response.json(
        { message: "Enter a valid email and 6-digit OTP." },
        { status: 400 },
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 2. Get saved OTP
    const savedOtp = store.emailOtps?.get(normalizedEmail);

    if (!savedOtp) {
      return Response.json(
        { message: "OTP not found. Please request a new OTP." },
        { status: 400 },
      );
    }

    // 3. Check OTP expiry
    if (Date.now() > savedOtp.expiresAt) {
      store.emailOtps.delete(normalizedEmail);

      return Response.json(
        { message: "OTP expired. Please request a new OTP." },
        { status: 400 },
      );
    }

    // 4. Compare OTP hash
    const enteredHash = createHash("sha256").update(otp).digest("hex");

    const isValid = timingSafeEqual(
      Buffer.from(enteredHash, "hex"),
      Buffer.from(savedOtp.otpHash, "hex"),
    );

    if (!isValid) {
      return Response.json(
        { message: "Incorrect OTP. Please try again." },
        { status: 400 },
      );
    }

    // 5. OTP is correct. Remove it so it cannot be reused.
    store.emailOtps.delete(normalizedEmail);

    // 6. Connect to MongoDB
    await connectDB();

    // 7. Check whether this email already exists
    const existingUser = await User.findOne({
      email: normalizedEmail,
    }).lean();

    if (existingUser) {
      const loginToken = generateToken({
        userId: existingUser._id,
        shopId: existingUser.shopId,
        email: existingUser.email,
      });

      await User.updateOne(
        { _id: existingUser._id },
        { $set: { token: loginToken } },
      );

      existingUser.token = loginToken;

      const response = NextResponse.json({
        success: true,
        isNewUser: false,
        user: existingUser,
        message: "OTP verified successfully.",
      });

      response.cookies.set({
        name: "userToken",
        value: loginToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 90,
      });

      return response;
    }

    // 9. New user
    return Response.json({
      success: true,
      isNewUser: true,
      message: "OTP verified. Please complete your signup.",
    });
  } catch (error) {
    // console.error("Verify OTP error:", error);

    return Response.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
