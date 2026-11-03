import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Service from "@/models/service/schema";
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
    if (authError)
      return NextResponse.json(
        { success: false, message: "Unauthorized - Invalid Auth Key" },
        { status: 401, headers: corsHeaders }
      );

    const body = await req.json();
    const { serviceName, serviceImage, servicePrice, displayPrice, offerPrice, shopId, duration, status } = body;

    if (!serviceName || !serviceImage || servicePrice === undefined || !shopId) {
      return NextResponse.json(
        { success: false, message: "All required fields must be provided!" },
        { status: 400, headers: corsHeaders }
      );
    }

    const existingService = await Service.findOne({ serviceName: serviceName.trim(), shopId });
    if (existingService) {
      return NextResponse.json(
        { success: false, message: "Service already exists for this shop!" },
        { status: 409, headers: corsHeaders }
      );
    }

    const newService = new Service({
      serviceName: serviceName.trim(),
      serviceImage,
      servicePrice,
      displayPrice,
      offerPrice,
      shopId,
      duration,
     status: status || "active", // ✅ default to active if not provided
    });

    await newService.save();

    return NextResponse.json(
      { success: true, message: "Service created successfully!", data: newService },
      { status: 201, headers: corsHeaders }
    );
  } catch (error) {
    // console.error("Error creating service:", error);
    return NextResponse.json(
      { success: false, message: "Server error! Could not create service." },
      { status: 500, headers: corsHeaders }
    );
  }
}
