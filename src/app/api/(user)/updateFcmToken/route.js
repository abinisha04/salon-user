import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/user/schema";
import { checkAuthKey } from "@/lib/authkey";
import { verifyToken } from "@/lib/jwt";

export async function POST(request) {
  try {
    const authError = checkAuthKey(request);
    if (authError) return authError;

    // Read JWT from the HTTP-only cookie
    const jwtToken = request.cookies.get("userToken")?.value;

    if (!jwtToken) {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 }
      );
    }

    const decoded = verifyToken(jwtToken);

    if (!decoded?.userId || !decoded?.shopId) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired session." },
        { status: 401 }
      );
    }

    const { fcmToken } = await request.json();

    if (typeof fcmToken !== "string" || !fcmToken.trim()) {
      return NextResponse.json(
        { success: false, message: "Valid FCM token is required." },
        { status: 400 }
      );
    }

    await connectDB();

    // Replace the existing token with this device's token
    const result = await User.updateOne(
      {
        _id: decoded.userId,
        shopId: decoded.shopId,
      },
      {
        $set: {
          fcmToken: fcmToken.trim(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "FCM token updated successfully.",
    });
  } catch (error) {
    console.error("FCM token update error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update FCM token." },
      { status: 500 }
    );
  }
}