import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Appointment from "@/models/appointment/schema";
import { db } from "@/lib/firebase";
import { doc, deleteDoc } from "firebase/firestore";
import { checkAuthKey } from "@/lib/authkey";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-auth-key",
};

// ✅ Preflight handler
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// ✅ DELETE appointment
export async function DELETE(req) {
  try {
    await connectDB();

    // Auth Key Check
    const authError = checkAuthKey(req);
    if (authError) return NextResponse.json(authError, { status: 401, headers: corsHeaders });

    // Read body
    const body = await req.json();
    const { appointmentId } = body;

    if (!appointmentId) {
      return NextResponse.json(
        { success: false, message: "appointmentId is required!" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Find the appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return NextResponse.json(
        { success: false, message: "Appointment not found!" },
        { status: 404, headers: corsHeaders }
      );
    }

    // Delete from MongoDB
    await Appointment.findByIdAndDelete(appointmentId);

    // Delete from Firebase
    await deleteDoc(doc(db, "appointments", appointmentId));

    return NextResponse.json(
      { success: true, message: "Appointment deleted successfully!" },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error", details: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
