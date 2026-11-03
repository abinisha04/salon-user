import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Shop from "@/models/shop/schema";
import { checkAuthKey } from "@/lib/authkey";

// ✅ CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-auth-key",
};

// ✅ Handle OPTIONS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// ✅ GET handler
export async function GET(req) {
  try {
    await connectDB();

    // ✅ Authorization
    const authError = checkAuthKey(req);
    if (authError) return authError;

    const { searchParams } = new URL(req.url);
    const shopIdParam = searchParams.get("shopId");  
    let data = [];

    if (shopIdParam) {
      // ✅ Split comma-separated IDs
      const idArray = shopIdParam
        .split(",")
        .map((id) => id.trim())
        .filter((id) => mongoose.Types.ObjectId.isValid(id)); // ✅ validate ObjectIds

      if (idArray.length === 0) {
        return NextResponse.json(
          { success: false, message: "Invalid shopId format" },
          { status: 400, headers: corsHeaders }
        );
      }

      // ✅ Fetch matching shops by ObjectIds
      data = await Shop.find({ _id: { $in: idArray } });
      if (!data.length) {
        return NextResponse.json(
          { success: false, message: "No shops found for provided ID(s)" },
          { status: 404, headers: corsHeaders }
        );
      }
    } else {
      // ✅ Fetch all shops if no shopId param
      data = await Shop.find();
    }

    // ✅ Response
    return NextResponse.json(
      {
        success: true,
        total: data.length,
        shops: data,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    // console.error("❌ GET Shop Error:", err);
    return NextResponse.json(
      { success: false, message: "Server error", details: err.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
