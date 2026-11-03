import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/user/schema";
import { checkAuthKey } from "@/lib/authkey";
import jwt from "jsonwebtoken";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-auth-key",
};

// Handle OPTIONS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(req) {
  try {
    await connectDB();

    // ✅ AuthKey validation
    const authError = checkAuthKey(req);
    if (authError) return authError;

    // ✅ Extract tokens
    const userToken = req.cookies.get("userToken")?.value;
    const shopToken = req.cookies.get("shopToken")?.value;

    // ✅ Extract query params
    const { searchParams } = new URL(req.url);
    const shopId = searchParams.get("shopId");
    const userIdParam = searchParams.get("userId");

    if (!shopId) {
      return NextResponse.json(
        { success: false, message: "shopId query param is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    let decoded = null;
    let isShopToken = false;

    // 🔹 Token verification only needed if userId is present
    if (userIdParam) {
      if (!userToken && !shopToken) {
        return NextResponse.json(
          { success: false, message: "No token found. Please login again!" },
          { status: 401, headers: corsHeaders }
        );
      }

      try {
        if (shopToken) {
          decoded = jwt.verify(shopToken, process.env.JWT_SECRET);
          isShopToken = decoded.role === "shop";
        } else {
          decoded = jwt.verify(userToken, process.env.JWT_SECRET);
        }
      } catch (err) {
        return NextResponse.json(
          { success: false, message: "Invalid or expired token" },
          { status: 401, headers: corsHeaders }
        );
      }
    }

    let users = [];

    // ✅ Case 1: userId param present → fetch specific user(s)
    if (userIdParam) {
      const idArray = userIdParam.split(",").map((id) => id.trim()).filter(Boolean);

      // ❌ If user token → can fetch only its own userId
      if (!isShopToken) {
        if (idArray.length !== 1 || idArray[0] !== decoded.userId) {
          return NextResponse.json(
            { success: false, message: "User token can fetch only its own data" },
            { status: 403, headers: corsHeaders }
          );
        }
      }

      // Fetch users from DB
      users = await User.find({ _id: { $in: idArray }, shopId }).lean();

      if (!users || users.length === 0) {
        return NextResponse.json(
          { success: false, message: "User(s) not found for this shop" },
          { status: 404, headers: corsHeaders }
        );
      }

      // ✅ Inject user token if it’s a user token request
      if (!isShopToken && userToken) {
        users = users.map(u => ({ ...u, token: userToken }));
      }
    } 
    // ✅ Case 2: only shopId → fetch all users, no token required
    else {
      users = await User.find({ shopId }).lean();
    }

    return NextResponse.json(
      { success: true, message: "Users fetched successfully", users },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    // console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error", details: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
