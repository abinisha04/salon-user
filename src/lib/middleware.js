import { NextResponse } from "next/server";
import { verifyToken, generateToken, getTokenDaysLeft } from "@/app/lib/jwt";
import connectDB from "@/app/lib/db";
import User from "@/app/models/user/schema";
import Shop from "@/app/models/shop/schema";

export async function middleware(req) {
  try {
    const userToken = req.cookies.get("userToken")?.value;
    const shopToken = req.cookies.get("shopToken")?.value;
    const token = userToken || shopToken;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized - No token" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 403 }
      );
    }

    const daysLeft = getTokenDaysLeft(token);

    // ✅  refresh
if (daysLeft !== null && daysLeft < 85) {
      const isUser = !!decoded.userId;

      const newToken = generateToken(
        isUser
          ? { userId: decoded.userId, shopId: decoded.shopId, email: decoded.email }
          : { shopId: decoded.shopId, name: decoded.name, email: decoded.email }
      );

      try {
        await connectDB();
        if (isUser) {
          await User.findByIdAndUpdate(decoded.userId, { token: newToken });
        } else {
          await Shop.findByIdAndUpdate(decoded.shopId, { token: newToken });
        }
      } catch (dbErr) {
        // console.error("Token DB refresh failed:", dbErr.message);
      }

      const response = NextResponse.next();
      response.cookies.set({
        name: isUser ? "userToken" : "shopToken",
        value: newToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 90,
      });

      return response;
    }

    return NextResponse.next();
  } catch (err) {
    // console.error("Middleware Error:", err);
    return NextResponse.json({ error: "Auth failed" }, { status: 403 });
  }
}

export const config = {
  matcher: [
    "/api/postShop/:path*",
    "/api/postUser/:path*",
    "/api/getShop/:path*",
    "/api/getUser/:path*",
  ],
};