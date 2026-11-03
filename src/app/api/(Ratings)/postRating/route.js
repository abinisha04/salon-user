import { NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/lib/db";
import Feedback from "@/models/Feedback/schema";
import { checkAuthKey } from "@/lib/authkey";

// Use the SAME Appointment model import path
// already used in your existing getAppointment API.
import Appointment from "@/models/appointment/schema";

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

    // Preserve your existing auth-key validation.
    const authError = checkAuthKey(req);

    if (authError) return authError;

    const body = await req.json();

    const { shopId, userId, rating, feedback } = body;

    // Validate IDs.
    if (
      !mongoose.Types.ObjectId.isValid(shopId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid shopId or userId" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate rating.
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        {
          success: false,
          message: "Rating must be an integer between 1 and 5",
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate optional feedback.
    if (feedback !== undefined && typeof feedback !== "string") {
      return NextResponse.json(
        { success: false, message: "Feedback must be text" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (typeof feedback === "string" && feedback.trim().length > 1000) {
      return NextResponse.json(
        { success: false, message: "Feedback cannot exceed 1000 characters" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Check whether the user has completed at least one
    // appointment at this shop.
    const completedAppointment = await Appointment.findOne({
      shopId,
      userId,
      status: "completed",
    }).lean();

    if (!completedAppointment) {
      return NextResponse.json(
        {
          success: false,
          message: "You can review only after completing an appointment.",
        },
        { status: 403, headers: corsHeaders }
      );
    }

    // Check whether this user already reviewed this shop.
    const existingReview = await Feedback.findOne({
      shopId,
      userId,
      reviewType: "shop",
    });

    if (existingReview) {
      return NextResponse.json(
        {
          success: false,
          message: "You have already reviewed this shop.",
        },
        { status: 409, headers: corsHeaders }
      );
    }

    // Save the new shop review in the existing Feedback collection.
    const newFeedback = await Feedback.create({
      shopId,
      userId,
      reviewType: "shop",
      rating,
      feedback: feedback?.trim() || "No feedback provided",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Shop review submitted successfully!",
        feedback: newFeedback,
      },
      { status: 201, headers: corsHeaders }
    );
  } catch (error) {
    // Protect against simultaneous duplicate submissions.
    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "You have already reviewed this shop.",
        },
        { status: 409, headers: corsHeaders }
      );
    }

    // console.error("POST Rating Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Server error! Could not submit review.",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}