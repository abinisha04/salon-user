// import { NextResponse } from "next/server";
// import { db } from "@/app/lib/firebase";
// import { doc, setDoc, Timestamp, collection } from "firebase/firestore";
// import connectDB from "@/app/lib/db";
// import Appointment from "@/app/models/appointment/schema";
// import { checkAuthKey } from "@/app/lib/authkey";

// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Methods": "POST, OPTIONS",
//   "Access-Control-Allow-Headers": "Content-Type, x-auth-key",
// };

// // ✅ CORS preflight
// export async function OPTIONS() {
//   return NextResponse.json({}, { headers: corsHeaders });
// }

// // ✅ POST: Create Appointment
// export async function POST(req) {
//   try {
//     // 🔐 Auth key check
//     const authError = checkAuthKey(req);
//     if (authError) return authError;

//     // 📥 Parse body
//     const body = await req.json();
//     const {
//       shopId,
//       userId,
//       serviceIds,
//       groomerId,
//       date,
//       time,
//       price,
//       status,
//     } = body;

//     // 🧾 Validation
//     if (
//       !shopId ||
//       !userId ||
//       !Array.isArray(serviceIds) ||
//       serviceIds.length === 0 ||
//       !groomerId ||
//       !date
//     ) {
//       return NextResponse.json(
//         { success: false, message: "Missing or invalid fields." },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     // 🟢 Status handling
//     const allowedStatus = ["active", "confirmed", "completed", "cancelled"];
//     const finalStatus = allowedStatus.includes(status)
//       ? status
//       : "active";

//     // ⚙️ Connect MongoDB
//     await connectDB();

//     // 💾 Save to MongoDB
//     const appointment = new Appointment({
//       shopId,
//       userId,
//       serviceIds,
//       groomerId,
//       date,
//       time,
//       price,
//       status: finalStatus,
//     });

//     const savedAppointment = await appointment.save();

//     // 🔥 Save to Firebase
// const appointmentRef = doc(db, "appointments", savedAppointment._id.toString());

// await setDoc(appointmentRef, {
//   shopId,
//   userId,
//   groomerId,
//   date: Timestamp.fromDate(new Date(date)),
//   time,
//   price,
//   status: finalStatus,
//   createdAt: Timestamp.now(),
// });


//     // ✅ Response
//     return NextResponse.json(
//       {
//         success: true,
//         message: "Appointment created successfully",
//         appointment: {
//           _id: savedAppointment._id,
//           firebaseId: appointmentRef.id,
//           shopId,
//           userId,
//           serviceIds,
//           groomerId,
//           date,
//           time,
//           price,
//           status: finalStatus,
//         },
//       },
//       { status: 201, headers: corsHeaders }
//     );
//   } catch (error) {
//     console.error("Appointment error:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         message: "Failed to create appointment",
//         error: error.message,
//       },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }




import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, setDoc, Timestamp, collection } from "firebase/firestore";
import connectDB from "@/lib/db";
import Appointment from "@/models/appointment/schema";
import { checkAuthKey } from "@/lib/authkey";

// 🔔 FCM
import { messaging } from "@/lib/firebaseAdmin";
import Shop from "@/models/shop/schema";
import User from "@/models/user/schema";


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-auth-key",
};

// ✅ CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// ✅ POST: Create Appointment
export async function POST(req) {
  try {
    // 🔐 Auth key check
    const authError = checkAuthKey(req);
    if (authError) return authError;

    // 📥 Parse body
    const body = await req.json();
    const {
      shopId,
      userId,
      serviceIds,
      groomerId,
      date,
      time,
      price,
      status,
    } = body;

    // 🧾 Validation
    if (
      !shopId ||
      !userId ||
      !Array.isArray(serviceIds) ||
      serviceIds.length === 0 ||
      !groomerId ||
      !date
    ) {
      return NextResponse.json(
        { success: false, message: "Missing or invalid fields." },
        { status: 400, headers: corsHeaders }
      );
    }

    // 🟢 Status handling
    const allowedStatus = ["active", "confirmed", "completed", "cancelled"];
    const finalStatus = allowedStatus.includes(status)
      ? status
      : "active";

    // ⚙️ Connect MongoDB
    await connectDB();

    // 💾 Save to MongoDB
    const appointment = new Appointment({
      shopId,
      userId,
      serviceIds,
      groomerId,
      date,
      time,
      price,
      status: finalStatus,
    });

    const savedAppointment = await appointment.save();

    // 🔔 SEND PUSH NOTIFICATION TO SHOP (AFTER SAVE)
    // try {
    //   const shop = await Shop.findById(shopId);

    //   if (shop?.fcmToken) {
    //     await admin.messaging().send({
    //       token: shop.fcmToken,
    //       notification: {
    //         title: "📅 New Appointment",
    //         body: "A new booking has been received",
    //       },
    //       data: {
    //         appointmentId: savedAppointment._id.toString(),
    //         shopId: shopId.toString(),
    //         type: "NEW_APPOINTMENT",
    //       },
    //     });

    //     console.log("🔔 Notification sent to shop");
    //   } else {
    //     console.log("❌ No FCM token found for shop");
    //   }
    // } catch (err) {
    //   console.error("❌ FCM send failed:", err.message);
    // }

// 🔔 SEND PUSH NOTIFICATION TO SHOP (AFTER SAVE)
try {
  const shop = await Shop.findById(shopId);
  const user = await User.findById(userId).select("name");

  // console.log("🏪 Shop found:", shop?.shopName);
  // console.log("🔑 Shop FCM token:", shop?.fcmToken);
  // console.log("👤 User name:", user?.name);

  if (shop?.fcmToken) {
    const result = await messaging.send({
      token: shop.fcmToken,
      data: {
        title: "📅 New Appointment",
        body: `${user?.name || "A customer"} booked an appointment`,
        appointmentId: savedAppointment._id.toString(),
        clickUrl: "/pages/home",
        type: "NEW_APPOINTMENT",
      },
    });
    // console.log("✅ FCM sent, result:", result);
  } else {
    // console.log("❌ No FCM token on shop — token was never saved");
  }
} catch (err) {
  // console.error("❌ FCM send failed:", err.message);
}



    // 🔥 Save to Firebase
    const appointmentRef = doc(collection(db, "appointments"));
    await setDoc(appointmentRef, {
      shopId,
      userId,
      serviceIds,
      groomerId,
      date: Timestamp.fromDate(new Date(date)),
      time,
      price,
      status: finalStatus,
      createdAt: Timestamp.now(),
    });

    // ✅ Response
    return NextResponse.json(
      {
        success: true,
        message: "Appointment created successfully",
        appointment: {
          _id: savedAppointment._id,
          firebaseId: appointmentRef.id,
          shopId,
          userId,
          serviceIds,
          groomerId,
          date,
          time,
          price,
          status: finalStatus,
        },
      },
      { status: 201, headers: corsHeaders }
    );
  } catch (error) {
    // console.error("Appointment error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create appointment",
        error: error.message,
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
