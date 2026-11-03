// // src/app/api/(user)/addUser/route.js
// import { NextResponse } from "next/server";
// import connectDB from "@/app/lib/db";
// import User from "@/app/models/user/schema";
// import { checkAuthKey } from "@/app/lib/authkey";
// import jwt from "jsonwebtoken";

// // ✅ CORS headers
// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*", // replace * with your frontend domain in production
//   "Access-Control-Allow-Methods": "POST, OPTIONS",
//   "Access-Control-Allow-Headers": "Content-Type, x-auth-key",
// };

// // ✅ Handle OPTIONS preflight request
// export async function OPTIONS() {
//   return NextResponse.json({}, { headers: corsHeaders });
// }

// export async function POST(req) {
//   try {
//     // 1️⃣ Connect to MongoDB
//     await connectDB();

//     // 2️⃣ AuthKey validation
//     const authError = checkAuthKey(req);
//     if (authError) return authError;

//     // 3️⃣ Allowed shop IDs
//     const shopIds = process.env.SHOP_ID?.split(",").map(id => id.trim());
//     if (!shopIds?.length) {
//       return NextResponse.json(
//         { error: "SHOP_IDs not configured" },
//         { status: 500, headers: corsHeaders }
//       );
//     }

//     // 4️⃣ Parse request body
//     const body = await req.json();
//     const { shopId, name, email, phone, age, gender, profileImage,fcmToken
//  } = body;

//     // 5️⃣ Validate shopId
//     if (!shopId || !shopIds.includes(shopId)) {
//       return NextResponse.json(
//         { error: "Invalid or unauthorized shopId" },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     // 6️⃣ Validate required fields
//     if (!name || !email || !phone || !age || !gender) {
//       return NextResponse.json(
//         { error: "Name, email, phone, age, and gender are required" },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     // 7️⃣ Check for duplicates
//     const existingUser = await User.findOne({ shopId, $or: [{ email }, { phone }] });
//     if (existingUser) {
//       return NextResponse.json(
//         { error: "User with this email or phone already exists for this shop" },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     // 8️⃣ Create new user
//     const newUser = new User({ shopId, name, email, phone, age, gender, profileImage,      fcmToken,
//  });

//     // 9️⃣ Generate JWT token
//     const token = jwt.sign(
//       { userId: newUser._id, shopId: newUser.shopId, email: newUser.email },
//       process.env.JWT_SECRET // no expiry
//     );

//     // 10️⃣ Save token in user document
//     newUser.token = token;
//     await newUser.save();

//     // 11️⃣ Set token in HTTP-only cookie
//     const response = NextResponse.json(
//       { message: "User added successfully", user: newUser },
//       { status: 201, headers: corsHeaders }
//     );
//     response.cookies.set({
//       name: "userToken",
//       value: token,
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict",
//       path: "/",
//     });

//     return response;
//   } catch (error) {
//     console.error("Error adding user:", error);
//     return NextResponse.json(
//       { error: "Internal server error", details: error.message },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }




// src/app/api/(user)/addUser/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/user/schema";
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

    const shopIds = process.env.SHOP_ID?.split(",").map(id => id.trim());
    if (!shopIds?.length) {
      return NextResponse.json(
        { error: "SHOP_IDs not configured" },
        { status: 500, headers: corsHeaders }
      );
    }

    const body = await req.json();
    const { shopId, name, email, phone, age, gender, profileImage, fcmToken } = body;

    if (!shopId || !shopIds.includes(shopId)) {
      return NextResponse.json(
        { error: "Invalid or unauthorized shopId" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!name || !email || !phone || !age || !gender) {
      return NextResponse.json(
        { error: "Name, email, phone, age, and gender are required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const existingUser = await User.findOne({ shopId, $or: [{ email }, { phone }] });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email or phone already exists for this shop" },
        { status: 400, headers: corsHeaders }
      );
    }

    const newUser = new User({ shopId, name, email, phone, age, gender, profileImage, fcmToken });

    // ✅ generateToken — 90 days expiry
    const token = generateToken({
      userId: newUser._id,
      shopId: newUser.shopId,
      email: newUser.email
    });

    newUser.token = token;
    await newUser.save();

    const response = NextResponse.json(
      { message: "User added successfully", user: newUser },
      { status: 201, headers: corsHeaders }
    );

    // ✅ maxAge added — 90 days
    response.cookies.set({
      name: "userToken",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 90,
    });

    return response;
  } catch (error) {
    // console.error("Error adding user:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}