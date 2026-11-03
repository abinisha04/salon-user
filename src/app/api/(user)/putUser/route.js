// src/app/api/(user)/updateUser/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/user/schema";
import { checkAuthKey } from "@/lib/authkey";

/**
 * Handles PUT requests to update a specific user's information.
 * The user is identified by a combination of `userId` and `shopId`.
 * The `shopId` must be one of the pre-configured allowed IDs.
 * @param {Request} req The incoming Next.js request object.
 * @returns {NextResponse} The JSON response indicating success or failure.
 */
export async function PUT(req) {
  try {
    // Establish connection to the MongoDB database.
    await connectDB();

    // Perform authentication key validation. If the key is invalid, return an error.
    const authError = checkAuthKey(req);
    if (authError) return authError;

    // Retrieve and parse the allowed shop IDs from environment variables.
    const shopIds = process.env.SHOP_ID?.split(",").map((id) => id.trim());
    if (!shopIds || shopIds.length === 0) {
      return NextResponse.json({ error: "SHOP_IDs not configured" }, { status: 500 });
    }

    // Parse the request body to get the update data.
    const body = await req.json();
    const { userId, shopId, name, email, phone, age, gender, role } = body;

    // Validate that the provided shopId is one of the allowed IDs.
    if (!shopId || !shopIds.includes(shopId)) {
      return NextResponse.json({ error: "Invalid or unauthorized shopId" }, { status: 400 });
    }

    // Validate that the userId is provided.
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    // Find the user by both `_id` and `shopId` to ensure the user belongs to the correct shop.
    const user = await User.findOne({ _id: userId, shopId });
    if (!user) {
      return NextResponse.json({ error: "User not found for this shop" }, { status: 404 });
    }

    // Update user fields individually if they are provided in the request body.
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    // Check for `age !== undefined` to allow updating with a falsy value like 0.
    if (age !== undefined) user.age = age;
    if (gender) user.gender = gender;
    if (role) user.role = role;

    // Save the updated user document to the database.
    await user.save();

    // Return a success response with the updated user data.
    return NextResponse.json(
      { message: "User updated successfully", user },
      { status: 200 }
    );
  } catch (error) {
    // Log the detailed server-side error for debugging.
    // console.error("Error updating user:", error);
    // Return a generic internal server error message to the client.
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
