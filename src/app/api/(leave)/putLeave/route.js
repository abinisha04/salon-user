import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Leave from "@/models/leave/schema";
import "@/models/shop/schema";
import "@/models/groomers/schema";
import { checkAuthKey } from "@/lib/authkey";

// ✅ CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-auth-key",
};

// ==========================
// OPTIONS → Preflight
// ==========================
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// ==========================
// PUT → Update Leave
// ==========================
export async function PUT(req) {
  try {
    await connectDB();

    // 🔐 Auth check
    const authError = checkAuthKey(req);
    if (authError) return authError;

    const body = await req.json();

    const { leaveId, isShop, shopId, groomerId, startDate, endDate, reason } =
      body;

    // ❗ leaveId required
    if (!leaveId) {
      return NextResponse.json(
        { success: false, message: "leaveId is required" },
        { status: 400, headers: corsHeaders },
      );
    }

    // 🔍 Find leave
    const leave = await Leave.findById(leaveId);
    if (!leave) {
      return NextResponse.json(
        { success: false, message: "Leave not found" },
        { status: 404, headers: corsHeaders },
      );
    }

    // ==========================
    // Update fields (only if sent)
    // ==========================

    if (typeof isShop === "boolean") leave.isShop = isShop;
    if (shopId) leave.shopId = shopId;

    if (groomerId !== undefined) {
      leave.groomerId = groomerId || null;
    }

    if (reason) leave.reason = reason.trim();

    // 📅 Dates
    if (startDate) {
      const sd = new Date(startDate);
      if (isNaN(sd.getTime())) {
        return NextResponse.json(
          { success: false, message: "Invalid startDate format" },
          { status: 400, headers: corsHeaders },
        );
      }
      leave.startDate = sd;
    }

    if (endDate) {
      const ed = new Date(endDate);
      if (isNaN(ed.getTime())) {
        return NextResponse.json(
          { success: false, message: "Invalid endDate format" },
          { status: 400, headers: corsHeaders },
        );
      }
      leave.endDate = ed;
    }

    // ⛔ Final logical validation
    if (leave.endDate < leave.startDate) {
      return NextResponse.json(
        { success: false, message: "endDate cannot be before startDate" },
        { status: 400, headers: corsHeaders },
      );
    }

    if (leave.isShop && leave.groomerId) {
      return NextResponse.json(
        { success: false, message: "groomerId must be null for shop leave" },
        { status: 400, headers: corsHeaders },
      );
    }

    if (!leave.isShop && !leave.groomerId) {
      return NextResponse.json(
        { success: false, message: "groomerId is required for groomer leave" },
        { status: 400, headers: corsHeaders },
      );
    }

    // 💾 Save
    await leave.save();

    return NextResponse.json(
      {
        success: true,
        message: "Leave updated successfully",
        leave,
      },
      { status: 200, headers: corsHeaders },
    );
  } catch (error) {
    // console.error("❌ PUT Leave Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error while updating leave",
        details: error.message,
      },
      { status: 500, headers: corsHeaders },
    );
  }
}
