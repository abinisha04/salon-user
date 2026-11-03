// import { NextResponse } from "next/server";
// import connectDB from "@/app/lib/db";
// import Shop from "@/app/models/shop/schema";
// import { checkAuthKey } from "@/app/lib/authkey";
// import jwt from "jsonwebtoken";

// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Methods": "POST, OPTIONS",
//   "Access-Control-Allow-Headers": "Content-Type, x-auth-key",
// };

// export async function OPTIONS() {
//   return NextResponse.json({}, { headers: corsHeaders });
// }

// export async function POST(req) {
//   try {
//     await connectDB();

//     const authError = checkAuthKey(req);
//     if (authError) return authError;

//     const body = await req.json();
//     const {
//       shopName,
//       shopEmail,
//       shopOwnerName,
//       shopMobile,
//       shopLocation,
//       latitude,
//       longitude,
//       shopImage,
//       openingHours,
//       closingDays,
//             fcmToken, // 👈 NEW

//     } = body;

//     if (
//       !shopName ||
//       !shopEmail ||
//       !shopOwnerName ||
//       !shopMobile ||
//       !shopLocation ||
//       latitude === undefined ||
//       longitude === undefined
//     ) {
//       return NextResponse.json(
//         { success: false, message: "All required fields must be provided!" },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     const existingShop = await Shop.findOne({
//       $or: [{ shopEmail }, { shopMobile }],
//     });

//     if (existingShop) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Shop with this email or mobile already exists",
//         },
//         { status: 409, headers: corsHeaders }
//       );
//     }

//     // ✅ Let MongoDB create ObjectId automatically
//     const newShop = new Shop({
//       shopName: shopName.trim(),
//       shopEmail: shopEmail.trim(),
//       shopOwnerName: shopOwnerName.trim(),
//       shopMobile,
//       shopLocation,
//       latitude,
//       longitude,
//       shopImage: shopImage || "",
//       openingHours: openingHours || [],
//       closingDays: closingDays || [],
//             fcmToken: fcmToken || null,

//     });

//     // ✅ newShop._id is already an ObjectId here (before save)
//     console.log("🆔 MongoDB ObjectId:", newShop._id); // e.g., ObjectId("6718f4...")

//     const token = jwt.sign(
//       {
//         shopId: newShop._id.toString(), // only for token safety
//         name: newShop.shopName,
//         email: newShop.shopEmail,
//       },
//       process.env.JWT_SECRET
//     );

//     // ✅ Keep Mongo ObjectId in DB
//     newShop.token = token;
//     await newShop.save();

//     // ✅ Send Response
//     const response = NextResponse.json(
//       {
//         success: true,
//         message: "Shop created successfully!",
//         shop: newShop, // contains ObjectId (not converted)
//       },
//       { status: 201, headers: corsHeaders }
//     );

//     response.cookies.set({
//       name: "shopToken",
//       value: token,
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict",
//       path: "/",
//     });

//     return response;
//   } catch (err) {
//     console.error("POST Shop Error:", err);
//     return NextResponse.json(
//       { success: false, message: "Server error", details: err.message },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }




import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Shop from "@/models/shop/schema";
import { checkAuthKey } from "@/lib/authkey";
import { generateToken } from "@/lib/jwt"; // ✅ changed

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-auth-key",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req) {
  try {
    await connectDB();

    const authError = checkAuthKey(req);
    if (authError) return authError;

    const body = await req.json();
    const {
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
      fcmToken,
    } = body;

    if (
      !shopName ||
      !shopEmail ||
      !shopOwnerName ||
      !shopMobile ||
      !shopLocation ||
      latitude === undefined ||
      longitude === undefined
    ) {
      return NextResponse.json(
        { success: false, message: "All required fields must be provided!" },
        { status: 400, headers: corsHeaders }
      );
    }

    const existingShop = await Shop.findOne({
      $or: [{ shopEmail }, { shopMobile }],
    });

    if (existingShop) {
      return NextResponse.json(
        { success: false, message: "Shop with this email or mobile already exists" },
        { status: 409, headers: corsHeaders }
      );
    }

    const newShop = new Shop({
      shopName: shopName.trim(),
      shopEmail: shopEmail.trim(),
      shopOwnerName: shopOwnerName.trim(),
      shopMobile,
      shopLocation,
      latitude,
      longitude,
      shopImage: shopImage || "",
      openingHours: openingHours || [],
      closingDays: closingDays || [],
      fcmToken: fcmToken || null,
    });

    // console.log("🆔 MongoDB ObjectId:", newShop._id);

    // ✅ generateToken — 90 days expiry
    const token = generateToken({
      shopId: newShop._id.toString(),
      name: newShop.shopName,
      email: newShop.shopEmail,
    });

    newShop.token = token;
    await newShop.save();

    const response = NextResponse.json(
      {
        success: true,
        message: "Shop created successfully!",
        shop: newShop,
      },
      { status: 201, headers: corsHeaders }
    );

    // ✅ maxAge added — 90 days
    response.cookies.set({
      name: "shopToken",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 90, // ✅ 7 days
    });

    return response;
  } catch (err) {
    // console.error("POST Shop Error:", err);
    return NextResponse.json(
      { success: false, message: "Server error", details: err.message },
      { status: 500, headers: corsHeaders }
    );
  }
}