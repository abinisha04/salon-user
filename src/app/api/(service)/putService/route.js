// src/app/api/service/put/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Service from "@/models/service/schema";
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
    // 1️⃣ Connect to MongoDB
    await connectDB();

    // 2️⃣ Validate auth key
    const authError = checkAuthKey(req);
    if (authError) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - Invalid Auth Key" },
        { status: 401, headers: corsHeaders }
      );
    }

    // 3️⃣ Parse request body
    const body = await req.json();
    const {
      serviceId,
      serviceName,
      serviceImage,
      servicePrice,
      displayPrice,
      offerPrice,
      duration,
      status,         // optional string: "active"/"inactive"
      serviceStatus,  // optional boolean: true/false
    } = body;

    // 4️⃣ Validate serviceId
    if (!serviceId) {
      return NextResponse.json(
        { success: false, message: "serviceId is required!" },
        { status: 400, headers: corsHeaders }
      );
    }

    // 5️⃣ Find service
    const service = await Service.findById(serviceId);
    if (!service) {
      return NextResponse.json(
        { success: false, message: "Service not found!" },
        { status: 404, headers: corsHeaders }
      );
    }

    // 6️⃣ Update fields if provided
    if (serviceName) service.serviceName = serviceName.trim();
    if (serviceImage) service.serviceImage = serviceImage;
    if (servicePrice !== undefined) service.servicePrice = servicePrice;
    if (displayPrice !== undefined) service.displayPrice = displayPrice;
    if (offerPrice !== undefined) service.offerPrice = offerPrice;
    if (duration !== undefined) service.duration = duration;
    if (status && ["active", "inactive"].includes(status)) service.status = status;
    if (serviceStatus !== undefined) service.serviceStatus = serviceStatus;

    // 7️⃣ Save updated service
    await service.save();

    // 8️⃣ Return updated service
    return NextResponse.json(
      { success: true, message: "Service updated successfully!", data: service },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    // console.error("Error updating service:", error);
    return NextResponse.json(
      { success: false, message: "Server error! Could not update service.", details: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
