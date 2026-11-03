import { randomInt, createHash } from "crypto";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const store = globalThis;

if (!store.emailOtps) {
  store.emailOtps = new Map();
}

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      return Response.json(
        { message: "Enter a valid email address." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const otp = randomInt(100000, 1000000).toString();

    const otpHash = createHash("sha256")
      .update(otp)
      .digest("hex");

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: normalizedEmail,
      subject: "Your Email Verification OTP",
      text: `Your OTP is ${otp}. It expires in 5 minutes.`,
    });

    store.emailOtps.set(normalizedEmail, {
      otpHash,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    return Response.json({
      message: "OTP email sent successfully.",
    });
  } catch (error) {
    // console.error("Send OTP error:", error);

    return Response.json(
      { message: "Unable to send OTP email." },
      { status: 500 }
    );
  }
}