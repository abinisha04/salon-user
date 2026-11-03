import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Shop from "@/models/shop/schema";
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
    await connectDB();

    const authError = checkAuthKey(req);
    if (authError) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - Invalid Auth Key" },
        { status: 401, headers: corsHeaders }
      );
    }

    const body = await req.json();
    const {
      shopId,
      shopName,
      shopEmail,
      shopOwnerName,
      shopMobile,
      shopLocation,
      latitude,
      longitude,
      shopImage,
      openingHours,
      closingDays,
      status,  fcmToken,  // ✅ ADD THIS

    } = body;
    if (!shopId) {
      return NextResponse.json(
        { success: false, message: "shopId is required!" },
        { status: 400, headers: corsHeaders }
      );
    }

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return NextResponse.json(
        { success: false, message: "Shop not found!" },
        { status: 404, headers: corsHeaders }
      );
    }

    if (fcmToken) shop.fcmToken = fcmToken; // ✅ ADD THIS

    // ✅ Email & Mobile Duplication Check
    if (shopEmail) {
      const exists = await Shop.findOne({ shopEmail, _id: { $ne: shopId } });
      if (exists) {
        return NextResponse.json(
          { success: false, message: "Email already exists for another shop!" },
          { status: 409, headers: corsHeaders }
        );
      }
    }

    if (shopMobile) {
      const exists = await Shop.findOne({ shopMobile, _id: { $ne: shopId } });
      if (exists) {
        return NextResponse.json(
          { success: false, message: "Mobile number already exists for another shop!" },
          { status: 409, headers: corsHeaders }
        );
      }
    }

    // ✅ Assign safe values
    if (shopName) shop.shopName = shopName.trim();
    if (shopEmail) shop.shopEmail = shopEmail.trim();
    if (shopOwnerName) shop.shopOwnerName = shopOwnerName.trim();
    if (shopMobile) shop.shopMobile = shopMobile;
    if (shopLocation) shop.shopLocation = shopLocation;
    if (latitude !== undefined) shop.latitude = latitude;
    if (longitude !== undefined) shop.longitude = longitude;
    if (shopImage) shop.shopImage = shopImage;
    if (closingDays) shop.closingDays = closingDays;
    if (status) shop.status = status;

    // ✅ Handle openingHours safely
    const DAYS = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    if (openingHours && Array.isArray(openingHours)) {
      // Clean incoming data
      const validHours = openingHours
        .filter(
          (h) =>
            h &&
            typeof h.day === "string" &&
            DAYS.includes(h.day) &&
            h.open &&
            h.close
        )
        .map((h) => ({
          day: h.day,
          open: h.open,
          close: h.close,
        }));

      // Merge with existing hours or fill missing days
      const merged = DAYS.map((day) => {
        const newDay = validHours.find((h) => h.day === day);
        const oldDay = shop.openingHours.find((h) => h.day === day);

        if (newDay) return newDay;
        if (oldDay) return oldDay;

        // default fallback (open all day)
        return { day, open: "09:00", close: "22:00" };
      });

      shop.openingHours = merged;
    }

    // ✅ Save and respond
    await shop.save();

    return NextResponse.json(
      { success: true, message: "Shop updated successfully!", data: shop },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    // console.error("❌ Error updating shop:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error! Could not update shop.",
        details: error.message,
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
