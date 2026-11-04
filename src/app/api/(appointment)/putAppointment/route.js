// import { NextResponse } from "next/server";
// import { db } from "@/app/lib/firebase";
// import { doc, updateDoc, Timestamp } from "firebase/firestore";
// import connectDB from "@/app/lib/db";
// import Appointment from "@/app/models/appointment/schema";
// import { checkAuthKey } from "@/app/lib/authkey";

// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Methods": "PUT, OPTIONS",
//   "Access-Control-Allow-Headers": "Content-Type, x-auth-key",
// };

// // ✅ Handle CORS preflight
// export async function OPTIONS() {
//   return NextResponse.json({}, { headers: corsHeaders });
// }

// // ✅ PUT: Update existing appointment in MongoDB + Firebase
// export async function PUT(req) {
//   try {
//     // 🔐 Auth check
//     const authError = checkAuthKey(req);
//     if (authError) return authError;

//     // 📥 Parse body
//     const body = await req.json();
//     const {
//       appointmentId, // required for MongoDB
//       firebaseId, // optional for Firebase sync
//       shopId,
//       userId,
//       serviceId,
//       groomerId,
//       date,
//       time,
//       price,
//       status,
//     } = body;

//     // 🧾 Validate appointmentId
//     if (!appointmentId) {
//       return NextResponse.json(
//         { success: false, message: "Missing appointmentId." },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     // 🟢 Handle status manually
//     let finalStatus = "active";
//     if (
//       status &&
//       ["active", "confirmed", "completed", "cancelled"].includes(status.trim())
//     ) {
//       finalStatus = status.trim();
//     }

//     // ⚙️ Connect MongoDB
//     await connectDB();

//     // 💾 Update in MongoDB
//     const updatedAppointment = await Appointment.findByIdAndUpdate(
//       appointmentId,
//       {
//         $set: {
//           shopId,
//           userId,
//           serviceId,
//           groomerId,
//           date,
//           time,
//           price,
//           status: finalStatus,
//           updatedAt: new Date(),
//         },
//       },
//       { new: true } // return updated document
//     );

//     if (!updatedAppointment) {
//       return NextResponse.json(
//         { success: false, message: "Appointment not found." },
//         { status: 404, headers: corsHeaders }
//       );
//     }

//     // 🔥 Update in Firebase (if firebaseId provided)
//     if (firebaseId) {
//       const appointmentRef = doc(db, "appointments", firebaseId);
//       await updateDoc(appointmentRef, {
//         shopId,
//         userId,
//         serviceId,
//         groomerId,
//         date: Timestamp.fromDate(new Date(date)),
//         time,
//         price,
//         status: finalStatus,
//         updatedAt: Timestamp.now(),
//       });
//     }

//     // ✅ Return success response
//     return NextResponse.json(
//       {
//         success: true,
//         message: "Appointment updated successfully in MongoDB & Firebase",
//         appointment: {
//           _id: updatedAppointment._id,
//           firebaseId: firebaseId || "N/A",
//           shopId,
//           userId,
//           serviceId,
//           groomerId,
//           date,
//           time,
//           price,
//           status: finalStatus,
//           updatedAt: updatedAppointment.updatedAt,
//         },
//       },
//       { status: 200, headers: corsHeaders }
//     );
//   } catch (error) {
//     console.error("Error updating appointment:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         message: "Failed to update appointment.",
//         details: error.message,
//       },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }
 





import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import connectDB from "@/lib/db";
import Appointment from "@/models/appointment/schema";
import { checkAuthKey } from "@/lib/authkey";

import { messaging } from "@/lib/firebaseAdmin";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import User from "@/models/user/schema";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-auth-key",
};

// ✅ Handle CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// ✅ PUT: Update existing appointment in MongoDB + Firebase
export async function PUT(req) {
  try {
    // 🔐 Auth check
    const authError = checkAuthKey(req);
    if (authError) return authError;

    // 📥 Parse body
    const body = await req.json();
    const {
      appointmentId, // required for MongoDB
      firebaseId, // optional for Firebase sync
      shopId,
      userId,
      serviceId,
      groomerId,
      date,
      time,
      price,
      status,
    } = body;
    //Notification date
    const formatDateTime = (date, time) => {
      const d = new Date(date);

      const formattedDate = d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      return `${formattedDate} at ${time}`;
    };

    // 🧾 Validate appointmentId
    if (!appointmentId) {
      return NextResponse.json(
        { success: false, message: "Missing appointmentId." },
        { status: 400, headers: corsHeaders },
      );
    }

    // 🟢 Handle status manually
    let finalStatus = "active";
    if (
      status &&
      ["active", "confirmed", "completed", "cancelled"].includes(status.trim())
    ) {
      finalStatus = status.trim();
    }

    // ⚙️ Connect MongoDB
    await connectDB();

    // 💾 Update in MongoDB
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      {
        $set: {
          shopId,
          userId,
          serviceId,
          groomerId,
          date,
          time,
          price,
          status: finalStatus,
          updatedAt: new Date(),
        },
      },
      { new: true }, // return updated document
    );

    if (!updatedAppointment) {
      return NextResponse.json(
        { success: false, message: "Appointment not found." },
        { status: 404, headers: corsHeaders },
      );
    }

    try {
      await adminDb
        .collection("appointmentStatusUpdates")
        .doc(updatedAppointment._id.toString())
        .set(
          {
            appointmentId: updatedAppointment._id.toString(),
            shopId: updatedAppointment.shopId.toString(),
            userId: updatedAppointment.userId.toString(),
            status: updatedAppointment.status,
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
    } catch (error) {
      // console.error("Firestore status sync failed:", error);
    }
    // 🔔 SEND PUSH NOTIFICATION TO USER (ON CANCEL / COMPLETE)
    
    // 🔔 SEND PUSH NOTIFICATION TO USER
    try {
      if (
        ["confirmed", "cancelled", "completed"].includes(finalStatus)
      ) {
        // 1. Get customer FCM token
        const user = await User.findById(
          updatedAppointment.userId
        ).select("fcmToken");

        const customerToken = user?.fcmToken;

        if (!customerToken) {
          // console.log("Customer FCM token not found");
        } else {
          // 2. Format appointment date and time
          const bookingTime = formatDateTime(
            updatedAppointment.date,
            updatedAppointment.time
          );

          // 3. Prepare notification content
          let title = "Appointment Update";
          let body = "";

          if (finalStatus === "confirmed") {
            title = "✅ Appointment Confirmed";
            body = `Your appointment on ${bookingTime} has been confirmed`;
          } else if (finalStatus === "cancelled") {
            title = "❌ Appointment Cancelled";
            body = `Your appointment on ${bookingTime} was cancelled`;
          } else if (finalStatus === "completed") {
            title = "✅ Appointment Completed";
            body = `Your appointment on ${bookingTime} is completed`;
          }

          // 4. Send data-only FCM notification
          const response = await messaging.send({
            token: customerToken,
            data: {
              title,
              body,
              appointmentId: updatedAppointment._id.toString(),
              status: finalStatus,
              bookingTime,
              type: "APPOINTMENT_STATUS",
              url: "/pages/bookingHistory",
            },
          });

          // console.log("🔔 Customer notification sent:", response);
        }
      }
    } catch (notificationError) {
      // console.error(
      //   "❌ Customer notification failed:",
      //   notificationError.message
      // );
    }


    // 🔥 Update in Firebase (if firebaseId provided)
    if (firebaseId) {
      const appointmentRef = doc(db, "appointments", firebaseId);
      await updateDoc(appointmentRef, {
        shopId,
        userId,
        serviceId,
        groomerId,
        date: Timestamp.fromDate(new Date(date)),
        time,
        price,
        status: finalStatus,
        updatedAt: Timestamp.now(),
      });
    }

    // ✅ Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Appointment updated successfully in MongoDB & Firebase",
        appointment: {
          _id: updatedAppointment._id,
          firebaseId: firebaseId || "N/A",
          shopId,
          userId,
          serviceId,
          groomerId,
          date,
          time,
          price,
          status: finalStatus,
          updatedAt: updatedAppointment.updatedAt,
        },
      },
      { status: 200, headers: corsHeaders },
    );
  } catch (error) {
    // console.error("Error updating appointment:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update appointment.",
        details: error.message,
      },
      { status: 500, headers: corsHeaders },
    );
  }
}
