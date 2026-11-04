import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Appointment from "@/models/appointment/schema";
import { checkAuthKey } from "@/lib/authkey";

// 🔥 REQUIRED for populate()
import "@/models/user/schema";
import "@/models/groomers/schema";
import "@/models/service/schema";

// ✅ CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-auth-key",
};

// ==========================
// OPTIONS → Preflight
// ==========================
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// ==========================
// GET → Fetch Appointments
// ==========================
export async function GET(req) {
  try {
    await connectDB();

    // 🔐 API key validation
    const authError = checkAuthKey(req);
    if (authError) return authError;

    const { searchParams } = new URL(req.url);

    // 🔍 Query params
    const appointmentIdParam = searchParams.get("appointmentId");
    const userId = searchParams.get("userId");
    const shopId = searchParams.get("shopId");
    const groomerId = searchParams.get("groomerId");
    const serviceIdsParam = searchParams.get("serviceIds");
    const dateParam = searchParams.get("date"); // YYYY-MM-DD
    const statusParam = searchParams.get("status"); // active,confirmed,...
    const dateScope = searchParams.get("dateScope"); // today | upcoming

    // ❌ Require at least ONE filter
    if (
      !appointmentIdParam &&
      !shopId &&
      !userId &&
      !groomerId &&
      !serviceIdsParam &&
      !dateParam &&
      !statusParam &&
      !dateScope
    ) {
      return NextResponse.json(
        { success: false, message: "Provide at least one query parameter" },
        { status: 400, headers: corsHeaders },
      );
    }

    // ==========================
    // 🧠 BUILD FILTER
    // ==========================
    const filter = {};

    // IDs
    if (appointmentIdParam) {
      filter._id = { $in: appointmentIdParam.split(",") };
    }

    if (shopId) filter.shopId = shopId;
    if (userId) filter.userId = userId;
    if (groomerId) filter.groomerId = groomerId;

    if (serviceIdsParam) {
      filter.serviceIds = { $in: serviceIdsParam.split(",") };
    }

    // ==========================
    // ✅ STATUS (ONLY if passed)
    // ==========================
    if (statusParam) {
      filter.status = {
        $in: statusParam.split(",").map((s) => s.trim().toLowerCase()),
      };
    }
    // else → NO status filter (returns all)

    // ==========================
    // 📅 DATE FILTERING
    // ==========================

    // 🔥 Only TODAY
    if (dateScope === "today") {
      const start = new Date();
      start.setHours(0, 0, 0, 0);

      const end = new Date();
      end.setHours(23, 59, 59, 999);

      filter.date = { $gte: start, $lte: end };
    }

    // 🔥 TODAY + FUTURE
    else if (dateScope === "upcoming") {
      const start = new Date();
      start.setHours(0, 0, 0, 0);

      filter.date = { $gte: start };
    }

    // 🔁 Specific Date
    else if (dateParam) {
      const start = new Date(dateParam);
      start.setHours(0, 0, 0, 0);

      const end = new Date(dateParam);
      end.setHours(23, 59, 59, 999);

      filter.date = { $gte: start, $lte: end };
    }
    // else → NO date filter

    // ==========================
    // 📦 FETCH DATA
    // ==========================
    const appointments = await Appointment.find(filter)
      .populate("userId")
      .populate("groomerId")
      .populate("serviceIds")
      .sort({ date: 1, time: 1 });

    if (!appointments.length) {
      return NextResponse.json(
        {
          success: true,
          count: 0,
          appointments: [],
          message: "No appointments found.",
        },
        { status: 200, headers: corsHeaders },
      );
    }

    return NextResponse.json(
      { success: true, count: appointments.length, appointments },
      { status: 200, headers: corsHeaders },
    );
  } catch (error) {
    console.error("❌ Fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error while fetching appointments",
        details: error.message,
      },
      { status: 500, headers: corsHeaders },
    );
  }
}
