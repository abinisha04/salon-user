import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Service from "@/models/service/schema";
import Shop from "@/models/shop/schema";
import { checkAuthKey } from "@/lib/authkey";

// 🌍 CORS Headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-auth-key",
};

// 🟢 OPTIONS
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// 🔵 GET → Fetch Services
export async function GET(req) {
  try {
    await connectDB();

    // 🔐 Auth validation
    const authError = checkAuthKey(req);
    if (authError) {
      return NextResponse.json(authError, {
        status: 401,
        headers: corsHeaders,
      });
    }

    // 🔎 Query params
    const { searchParams } = new URL(req.url);
    const shopIdParam = searchParams.get("shopId");   // ✅ REQUIRED
    const serviceIdParam = searchParams.get("serviceId");
    const statusParam = searchParams.get("status");   // active | inactive

    // ❌ shopId mandatory check
    if (!shopIdParam) {
      return NextResponse.json(
        { success: false, message: "shopId is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const shopIds = shopIdParam
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    // ❌ Validate shop existence
    const validShops = await Shop.find({ _id: { $in: shopIds } });
    if (!validShops.length) {
      return NextResponse.json(
        { success: false, message: "Invalid shopId(s)" },
        { status: 404, headers: corsHeaders }
      );
    }

    // 🧠 Build filter
    const filter = {
      shopId: { $in: shopIds },
    };

    // ✅ Status filter
    if (statusParam) {
      if (!["active", "inactive"].includes(statusParam)) {
        return NextResponse.json(
          { success: false, message: "Invalid status value" },
          { status: 400, headers: corsHeaders }
        );
      }
      filter.status = statusParam;
    }

    // ✅ Service ID filter
    if (serviceIdParam) {
      const serviceIds = serviceIdParam
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);

      filter._id = { $in: serviceIds };
    }

    // 🔍 Fetch services
    const services = await Service.find(filter);

    if (!services.length) {
      return NextResponse.json(
        { success: false, message: "No services found!" },
        { status: 404, headers: corsHeaders }
      );
    }

    // ✅ Success
    return NextResponse.json(
      {
        success: true,
        count: services.length,
        data: services,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    // console.error("❌ Error fetching services:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
        details: error.message,
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
