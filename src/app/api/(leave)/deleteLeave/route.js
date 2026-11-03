import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Leave from "@/models/leave/schema";
import { checkAuthKey } from "@/lib/authkey";

// ✅ CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-auth-key",
};

// ==========================
// OPTIONS → Preflight
// ==========================
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// ==========================
// DELETE → Remove Leave
// ==========================
export async function DELETE(req) {
  try {
    await connectDB();

    // 🔐 Auth check
    const authError = checkAuthKey(req);
    if (authError) return authError;

    const body = await req.json();
    const { leaveId } = body;

    // ❌ Validation
    if (!leaveId) {
      return NextResponse.json(
        { success: false, message: "leaveId is required" },
        { status: 400, headers: corsHeaders },
      );
    }

    // 🔍 Find & delete
    const deletedLeave = await Leave.findByIdAndDelete(leaveId);

    if (!deletedLeave) {
      return NextResponse.json(
        { success: false, message: "Leave not found" },
        { status: 404, headers: corsHeaders },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Leave deleted successfully",
        deletedLeave,
      },
      { status: 200, headers: corsHeaders },
    );
  } catch (error) {
    // console.error("❌ DELETE Leave Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error while deleting leave",
        details: error.message,
      },
      { status: 500, headers: corsHeaders },
    );
  }
}
