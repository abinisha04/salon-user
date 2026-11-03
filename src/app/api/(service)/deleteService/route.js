// src/app/api/service/delete/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Service from "@/models/service/schema";
import { checkAuthKey } from "@/lib/authkey";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Replace * with your allowed domains in production
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
// DELETE → Delete a Service
// ==========================
export async function DELETE(req) {
  try {
    await connectDB();

    // 1️⃣ Check Auth Key
    const authError = checkAuthKey(req);
    if (authError) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - Invalid Auth Key" },
        { status: 401, headers: corsHeaders }
      );
    }

    // 2️⃣ Parse request body
    const body = await req.json();
    const { serviceId } = body;

    if (!serviceId) {
      return NextResponse.json(
        { success: false, message: "serviceId is required!" },
        { status: 400, headers: corsHeaders }
      );
    }

    // 3️⃣ Find the service
    const service = await Service.findById(serviceId);
    if (!service) {
      return NextResponse.json(
        { success: false, message: "Service not found!" },
        { status: 404, headers: corsHeaders }
      );
    }

    // 4️⃣ Delete service
    await service.deleteOne();

    // 5️⃣ Return success
    return NextResponse.json(
      { success: true, message: "Service deleted successfully!" },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    // console.error("Error deleting service:", error);
    return NextResponse.json(
      { success: false, message: "Server error! Could not delete service.", details: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
