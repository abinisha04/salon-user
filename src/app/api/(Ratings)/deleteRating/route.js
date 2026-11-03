// src/app/api/ratings/delete/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Feedback from "@/models/Feedback/schema";
import { checkAuthKey } from "@/lib/authkey";

// ✅ CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // ⚠️ replace * with specific domains in production
  "Access-Control-Allow-Methods": "DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-auth-key",
};

// ✅ Handle OPTIONS preflight request
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// ==========================
// DELETE → Remove Feedback
// ==========================
export async function DELETE(req) {
  try {
    // 1️⃣ Connect DB
    await connectDB();

    // 2️⃣ Check API key
    const authError = checkAuthKey(req);
    if (authError) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - Invalid Auth Key" },
        { status: 401, headers: corsHeaders }
      );
    }

    // 3️⃣ Parse body
    const body = await req.json();
    const { feedbackId } = body;

    if (!feedbackId) {
      return NextResponse.json(
        { success: false, message: "feedbackId is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    // 4️⃣ Delete feedback
    const deletedFeedback = await Feedback.findByIdAndDelete(feedbackId);

    if (!deletedFeedback) {
      return NextResponse.json(
        { success: false, message: "Feedback not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    // 5️⃣ Success response
    return NextResponse.json(
      { success: true, message: "Feedback deleted successfully!" },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    // console.error("❌ DELETE Ratings Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error! Could not delete feedback." },
      { status: 500, headers: corsHeaders }
    );
  }
}
