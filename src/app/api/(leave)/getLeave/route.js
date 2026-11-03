// src/app/api/leave/get/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Leave from "@/models/leave/schema";
import "@/models/shop/schema";
import "@/models/groomers/schema";
import { checkAuthKey } from "@/lib/authkey";

// ✅ CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-auth-key",
};

// ==========================
// OPTIONS → Preflight
// ==========================
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// ==========================
// GET → Fetch Leaves
// ==========================
export async function GET(req) {
  try {
    await connectDB();

    // 🔐 Auth check
    const authError = checkAuthKey(req);
    if (authError) return authError;

    const { searchParams } = new URL(req.url);

    const leaveIdParam = searchParams.get("leaveId");
    const shopId = searchParams.get("shopId");
    const groomerId = searchParams.get("groomerId");
    const isShopParam = searchParams.get("isShop");

    // 📅 Date params
    const dateParam = searchParams.get("date"); // single date
    const startDateParam = searchParams.get("startDate"); // range start
    const endDateParam = searchParams.get("endDate"); // range end

    const filter = {};

    // 🔹 Leave IDs
    if (leaveIdParam) {
      filter._id = {
        $in: leaveIdParam
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean),
      };
    }

    // 🔹 Shop / Groomer
    if (shopId) filter.shopId = shopId;
    if (groomerId) filter.groomerId = groomerId;

    // 🔹 isShop
    if (isShopParam !== null) {
      filter.isShop = isShopParam === "true";
    }

    // ==========================
    // 📅 DATE FILTERING
    // ==========================

    // ✅ Case 1: Single date
    if (dateParam) {
      const date = new Date(dateParam);
      if (isNaN(date.getTime())) {
        return NextResponse.json(
          { success: false, message: "Invalid date format" },
          { status: 400, headers: corsHeaders },
        );
      }

      filter.startDate = { $lte: date };
      filter.endDate = { $gte: date };
    }

    // ✅ Case 2: Date range
    if (startDateParam && endDateParam) {
      const startDate = new Date(startDateParam);
      const endDate = new Date(endDateParam);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return NextResponse.json(
          { success: false, message: "Invalid startDate or endDate" },
          { status: 400, headers: corsHeaders },
        );
      }

      filter.startDate = { $lte: endDate };
      filter.endDate = { $gte: startDate };
    }

    // 📦 Fetch leaves
    const leaves = await Leave.find(filter)
      .populate("shopId")
      .populate("groomerId")
      .sort({ startDate: -1 });

    return NextResponse.json(
      {
        success: true,
        count: leaves.length,
        leaves,
      },
      { status: 200, headers: corsHeaders },
    );
  } catch (error) {
    // console.error("❌ GET Leave Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error while fetching leaves",
        details: error.message,
      },
      { status: 500, headers: corsHeaders },
    );
  }
}
