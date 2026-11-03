import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Feedback from "@/models/Feedback/schema";
import { checkAuthKey } from "@/lib/authkey";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-auth-key",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function PUT(req) {
  try {
    await connectDB();

    const authError = checkAuthKey(req);

    if (authError) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - Invalid Auth Key" },
        { status: 401, headers: corsHeaders }
      );
    }

    const body = await req.json();

    const { feedbackId, shopId, userId, rating, feedback } = body;

    // Validate IDs
    if (
      !mongoose.Types.ObjectId.isValid(feedbackId) ||
      !mongoose.Types.ObjectId.isValid(shopId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid feedbackId, shopId or userId" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate rating
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: "Rating must be between 1 and 5" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (typeof feedback !== "string" || feedback.length > 1000) {
      return NextResponse.json(
        { success: false, message: "Invalid feedback" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Update only this customer's shop review
    const updatedFeedback = await Feedback.findOneAndUpdate(
      {
        _id: feedbackId,
        shopId,
        userId,
        reviewType: "shop",
      },
      {
        $set: {
          rating,
          feedback: feedback.trim() || "No feedback provided",
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedFeedback) {
      return NextResponse.json(
        { success: false, message: "Review not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Shop review updated successfully",
        data: updatedFeedback,
      },
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    // console.error("PUT Ratings Error:", error);

    return NextResponse.json(
      { success: false, message: "Server error! Could not update feedback." },
      { status: 500, headers: corsHeaders }
    );
  }
}