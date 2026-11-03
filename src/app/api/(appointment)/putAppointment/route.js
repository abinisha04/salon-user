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
    // 🔔 SEND PUSH NOTIFICATION TO USER (ON CANCEL / COMPLETE)
    // 🔔 SEND PUSH NOTIFICATION TO USER
    try {
      if (finalStatus === "cancelled" || finalStatus === "completed") {
        const user = await User.findById(updatedAppointment.userId).select(
          "fcmToken",
        );

        if (user?.fcmToken) {
          const bookingTime = formatDateTime(
            updatedAppointment.date,
            updatedAppointment.time,
          );

          const title =
            finalStatus === "cancelled"
              ? "❌ Appointment Cancelled"
              : "✅ Appointment Completed";

          const body =
            finalStatus === "cancelled"
              ? `Your appointment on ${bookingTime} was cancelled`
              : `Your appointment on ${bookingTime} is completed`;

          const messageId = await messaging.send({
            token: user.fcmToken,

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

          console.log("FCM SUCCESS:", messageId);
        } else {
          console.log("FCM ERROR: User FCM token not found");
        }
      }
    } catch (err) {
      console.error("FCM ERROR:", err.code, err.message);
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
