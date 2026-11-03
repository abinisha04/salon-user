import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Groomer from "@/models/groomers/schema";
import Service from "@/models/service/schema";
import { checkAuthKey } from "@/lib/authkey";

// ==========================
// CORS headers
// ==========================
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-auth-key",
};

// ==========================
// OPTIONS → Preflight Handler
// ==========================
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// ==========================
// POST → Create a new Groomer
// ==========================
export async function POST(req) {
  try {
    await connectDB();

    // ✅ Validate API key
    const authError = checkAuthKey(req);
    if (authError) return authError;

    // ✅ Parse incoming JSON
    const body = await req.json();
    const {
      name,
      email,
      phone,
      gender,
      age,
      shopId,
      department,
      profileImage,
      serviceList, // array of service IDs
      status,      // optional: "active" or "inactive"
    } = body;

    // console.log("Incoming Groomer Data:", body);

    // ✅ Validate required fields
    if (!name || !email || !phone || !gender || !age || !shopId || !serviceList) {
      return NextResponse.json(
        {
          success: false,
          message:
            "All required fields (name, email, phone, gender, age, shopId, serviceList) must be provided!",
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // ✅ Check for duplicate phone or email in same shop
    const existingGroomer = await Groomer.findOne({
      shopId,
      $or: [{ email }, { phone }],
    });

    if (existingGroomer) {
      const field = existingGroomer.email === email ? "email" : "phone number";
      return NextResponse.json(
        {
          success: false,
          message: `Groomer with this ${field} already exists in this shop!`,
        },
        { status: 409, headers: corsHeaders }
      );
    }

    // ✅ Validate that all services belong to the same shop
    const validServices = await Service.find({
      _id: { $in: serviceList },
      shopId,
    });

    if (validServices.length !== serviceList.length) {
      return NextResponse.json(
        {
          success: false,
          message: "One or more selected services are invalid for this shop!",
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // ✅ Save status as-is (lowercase) or default to "active"
    const groomerStatus = status ? status.toLowerCase() : "active";

    // ✅ Create new groomer
    const newGroomer = new Groomer({
      name,
      email,
      phone,
      gender,
      age,
      shopId,
      department,
      profileImage: profileImage || "",
      serviceList: serviceList,
      status: groomerStatus,
    });

    // ✅ Save to database
    await newGroomer.save();

    // console.log("✅ Groomer Created:", newGroomer);

    return NextResponse.json(
      {
        success: true,
        message: "Groomer created successfully!",
        data: newGroomer,
      },
      { status: 201, headers: corsHeaders }
    );
  } catch (error) {
    // console.error("❌ Error creating groomer:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error! Could not create groomer.",
        details: error.message,
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
