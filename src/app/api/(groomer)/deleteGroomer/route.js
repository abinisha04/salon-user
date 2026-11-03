// src/app/api/groomer/delete/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Groomer from "@/models/groomers/schema";
import { checkAuthKey } from "@/lib/authkey";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-auth-key",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function DELETE(req) {
  try {
    await connectDB();

    // ✅ Check auth key
    const authError = checkAuthKey(req);
    if (authError) return authError;

    const data = await req.json();
    const { groomerId } = data;

    if (!groomerId) {
      return NextResponse.json(
        { success: false, message: "groomerId is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    // ✅ Fetch groomer manually
    const groomer = await Groomer.findOne({ _id: groomerId });
    if (!groomer) {
      return NextResponse.json(
        { success: false, message: "Groomer not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    // ✅ Delete groomer manually
    await groomer.deleteOne();

    return NextResponse.json(
      { success: true, message: "Groomer deleted successfully" },
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    // console.error("DELETE Groomer Error:", err);
    return NextResponse.json(
      { success: false, message: "Server error", details: err.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
