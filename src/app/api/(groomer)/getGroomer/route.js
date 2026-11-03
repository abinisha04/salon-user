import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Groomer from "@/models/groomers/schema";
import { checkAuthKey } from "@/lib/authkey";

// 🔥 REQUIRED for populate()
import "@/models/service/schema";

// ==========================
// CORS HEADERS
// ==========================
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
// GET → Fetch Groomers (with Services)
// ==========================
export async function GET(req) {
  try {
    await connectDB();

    // 🔐 Validate API Key
    const authError = checkAuthKey(req);
    if (authError) return authError;

    const { searchParams } = new URL(req.url);

    // 🔍 Query Params
    const shopId = searchParams.get("shopId");
    const groomerIdParam = searchParams.get("groomerId"); // comma-separated

    // ❌ Validation
    if (!shopId && !groomerIdParam) {
      return NextResponse.json(
        {
          success: false,
          message: "shopId or groomerId is required",
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // 🧠 Build filter dynamically
    const filter = {};

    // Groomer IDs
    if (groomerIdParam) {
      filter._id = {
        $in: groomerIdParam
          .split(",")
          .map(id => id.trim())
          .filter(Boolean),
      };
    }

    // Shop ID
    if (shopId) {
      filter.shopId = shopId;
    }

    // 📦 Fetch Groomers + Populate Services
    const groomers = await Groomer.find(filter)
      .populate("serviceList") // MUST match schema field
      .sort({ createdAt: 1 });

    // ❌ No data
    if (!groomers.length) {
      return NextResponse.json(
        {
          success: false,
          message: "No groomers found",
        },
        { status: 404, headers: corsHeaders }
      );
    }

    // ✅ Success
    return NextResponse.json(
      {
        success: true,
        count: groomers.length,
        groomers,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    // console.error("❌ Error fetching groomers:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Server error while fetching groomers",
        details: error.message,
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
