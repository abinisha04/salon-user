import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Leave from "@/models/leave/schema";
import { checkAuthKey } from "@/lib/authkey";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-auth-key",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req) {
  try {
    await connectDB();

    const authError = checkAuthKey(req);
    if (authError) return authError;

    const body = await req.json();
    const { isShop, shopId, groomerId, startDate, endDate, reason } = body;

    // ✅ Basic validation
    if (!shopId || typeof isShop !== "boolean" || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400, headers: corsHeaders },
      );
    }

    const parsedStart = new Date(startDate);
    const parsedEnd = new Date(endDate);

    if (isNaN(parsedStart.getTime()) || isNaN(parsedEnd.getTime())) {
      return NextResponse.json(
        { success: false, message: "Invalid date format" },
        { status: 400, headers: corsHeaders },
      );
    }

    // ✅ Create leave
    const leave = await Leave.create({
      isShop,
      shopId,
      groomerId: isShop ? null : groomerId,
      startDate: parsedStart,
      endDate: parsedEnd,
      reason: reason?.trim(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Leave created successfully",
        data: leave,
      },
      { status: 201, headers: corsHeaders },
    );
  } catch (error) {
    // console.error("❌ Leave Create Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Server error",
      },
      { status: 500, headers: corsHeaders },
    );
  }
}
