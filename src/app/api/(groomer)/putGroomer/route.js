// src/app/api/groomer/put/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Groomer from "@/models/groomers/schema";
import Service from "@/models/service/schema";
import { checkAuthKey } from "@/lib/authkey";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-auth-key", 
};

// ==========================
// OPTIONS → Preflight Handler
// ==========================
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// ==========================
// PUT → Update an existing Groomer
// ==========================
export async function PUT(req) {
  try {
    await connectDB();

    // ✅ Validate API key
    const authError = checkAuthKey(req);
    if (authError) return authError;

    const body = await req.json();
    const {
      groomerId,   // required
      name,
      email,
      phone,
      gender,
      age,
      department,
      profileImage,
      joiningDate,
      serviceList, // optional array of service IDs
      status,      // optional: "active" or "inactive"
    } = body;

    if (!groomerId) {
      return NextResponse.json(
        { success: false, message: "groomerId is required to update!" },
        { status: 400, headers: corsHeaders }
      );
    }

    // ✅ Find the groomer
    const groomer = await Groomer.findById(groomerId);
    if (!groomer) {
      return NextResponse.json(
        { success: false, message: "Groomer not found!" },
        { status: 404, headers: corsHeaders }
      );
    }

    // ✅ Check for duplicate email or phone in the same shop
    if (email || phone) {
      const duplicate = await Groomer.findOne({
        _id: { $ne: groomerId },
        shopId: groomer.shopId,
        $or: [{ email }, { phone }],
      });
      if (duplicate) {
        const field = duplicate.email === email ? "email" : "phone number";
        return NextResponse.json(
          { success: false, message: `Another groomer with this ${field} already exists in the shop!` },
          { status: 409, headers: corsHeaders }
        );
      }
    } 

   
// ✅ Validate serviceList if provided
if (Array.isArray(serviceList)) {
  const validServices = await Service.find({
    _id: { $in: serviceList },
    shopId: groomer.shopId,
  });

  if (validServices.length !== serviceList.length) {
    return NextResponse.json(
      { success: false, message: "One or more services are invalid for this shop!" },
      { status: 400, headers: corsHeaders }
    );
  }

  // ✅ CORRECT FIELD NAME
  groomer.serviceList = serviceList;
}


    // ✅ Update fields if provided
    if (name) groomer.name = name;
    if (email) groomer.email = email;
    if (phone) groomer.phone = phone;
    if (gender) groomer.gender = gender;
    if (age) groomer.age = age;
    if (department) groomer.department = department;
    if (profileImage) groomer.profileImage = profileImage;
    if (joiningDate) groomer.joiningDate = joiningDate;

    // ✅ Update status if provided (normalize to lowercase)
    if (status) {
      const lowerStatus = status.toLowerCase();
      if (["active", "inactive"].includes(lowerStatus)) {
        groomer.status = lowerStatus;
      } else {
        return NextResponse.json(
          { success: false, message: "Invalid status! Must be 'active' or 'inactive'." },
          { status: 400, headers: corsHeaders }
        );
      }
    }

    // ✅ Save updated groomer
    await groomer.save();

    return NextResponse.json(
      { success: true, message: "Groomer updated successfully!", data: groomer },
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    // console.error("Error updating groomer:", error);
    return NextResponse.json(
      { success: false, message: "Server error! Could not update groomer.", details: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
