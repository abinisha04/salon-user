import { NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/lib/db";
import Feedback from "@/models/Feedback/schema";
import User from "@/models/user/schema";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const shopId = searchParams.get("shopId");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("limit") || "10", 10)),
    );
    const sortBy = searchParams.get("sortBy") || "newest";

    if (!shopId || !mongoose.Types.ObjectId.isValid(shopId)) {
      return NextResponse.json(
        { success: false, message: "Valid shopId is required" },
        { status: 400 },
      );
    }

    const shopObjectId = new mongoose.Types.ObjectId(shopId);

    const filter = {
      shopId: shopObjectId,
      reviewType: "shop",
    };

    // Overall rating and star distribution
    const ratingStats = await Feedback.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
          totalRating: { $sum: "$rating" },
        },
      },
    ]);

    const totalReviews = ratingStats.reduce((sum, item) => sum + item.count, 0);

    const totalRating = ratingStats.reduce(
      (sum, item) => sum + item.totalRating,
      0,
    );

    const averageRating =
      totalReviews > 0 ? Number((totalRating / totalReviews).toFixed(1)) : 0;

    const ratingBreakdown = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    ratingStats.forEach((item) => {
      ratingBreakdown[item._id] = item.count;
    });

    let sortOption = { createdAt: -1 };

    if (sortBy === "highest") {
      sortOption = { rating: -1, createdAt: -1 };
    } else if (sortBy === "lowest") {
      sortOption = { rating: 1, createdAt: -1 };
    }

    // Paginated reviews
    const reviews = await Feedback.find(filter)
      .populate("userId", "name")
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const formattedReviews = reviews.map((review) => ({
      _id: review._id,
      userName: review.userId?.name || "Customer",
      rating: review.rating,
      feedback: review.feedback,
      createdAt: review.createdAt,
    }));

    return NextResponse.json(
      {
        success: true,
        averageRating,
        totalReviews,
        ratingBreakdown,
        reviews: formattedReviews,
        currentPage: page,
        totalPages: Math.ceil(totalReviews / limit),
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      },
    );
  } catch (error) {
    // console.error("Get shop feedback error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch shop feedback" },
      { status: 500 },
    );
  }
}
