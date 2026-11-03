import { NextResponse } from "next/server";

import connectDB from "@/lib/db";
import Feedback from "@/models/Feedback/schema";
import { checkAuthKey } from "@/lib/authkey";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-auth-key",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(req) {
  try {
    await connectDB();

    const authError = checkAuthKey(req);

    if (authError) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - Invalid Auth Key" },
        { status: 401, headers: corsHeaders }
      );
    }

    const { searchParams } = new URL(req.url);

    const shopId = searchParams.get("shopId");
    const userId = searchParams.get("userId");
    const groomerIdParam = searchParams.get("groomerId");

    if (!shopId) {
      return NextResponse.json(
        { success: false, message: "shopId is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    // NEW: Check whether a particular customer reviewed this shop.
    if (userId) {
      const review = await Feedback.findOne({
        shopId,
        userId,
        reviewType: "shop",
      }).lean();

      // Always return 200, even when no review exists.
      return NextResponse.json(
        {
          success: true,
          reviewed: Boolean(review),
          data: review || null,
        },
        { status: 200, headers: corsHeaders }
      );
    }

    // EXISTING: Retain groomer-rating functionality.
    const query = {
      shopId,
      $or: [
        { reviewType: "groomer" },
        { reviewType: { $exists: false } },
      ],
    };

    if (groomerIdParam) {
      const idArray = groomerIdParam
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);

      query.groomerId = { $in: idArray };
    }

    const feedbacks = await Feedback.find(query).sort({ createdAt: -1 });

    if (!feedbacks.length) {
      return NextResponse.json(
        {
          success: false,
          message: "No ratings found for the given filters.",
          data: [],
        },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      {
        success: true,
        count: feedbacks.length,
        data: feedbacks,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    // console.error("GET Ratings Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Server error! Could not fetch ratings.",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}