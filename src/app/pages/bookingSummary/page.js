// // Before Optimize code

// "use client";
// // 👆 Marks this component as a Client Component so hooks, localStorage,
// // sessionStorage, and browser APIs can be used

// import { useEffect, useState } from "react";
// // 👆 React hooks for state and lifecycle management

// import Image from "next/image";
// // 👆 Optimized image handling from Next.js

// import { useRouter } from "next/navigation";
// // 👆 Next.js router for navigation and redirects

// import { Scissors } from "lucide-react";
// // 👆 Icon used in Services section

// import LottieLoader from "@/app/utils/loading";
// // 👆 Animated loader shown while booking is submitting

// import SuccessLottie from "@/app/utils/done";
// // 👆 Success animation shown after booking is completed

// export default function BookingSummaryPage() {
//   // ---------------- ROUTER ----------------
//   const router = useRouter();
//   // 👆 Used to redirect user after success or on invalid state

//   // ---------------- ENV VARIABLES ----------------
//   // const backendUrl = process.env.BACKEND_URL;
//   // 👆 Backend API base URL

//   // const authKey = process.env.AUTH_KEY;
//   // 👆 Auth key required for protected APIs

//   const shopId = process.env.NEXT_PUBLIC_SHOP_ID;
//   // 👆 Default shop ID (if needed elsewhere)

//   // ---------------- STATE ----------------
//   const [data, setData] = useState(null);
//   // 👆 Holds booking summary data fetched from sessionStorage

//   const [submitting, setSubmitting] = useState(false);
//   // 👆 True while booking request is in progress

//   const [showSuccess, setShowSuccess] = useState(false);
//   // 👆 Controls success animation visibility

//   // ---------------- USER FROM LOCAL STORAGE ----------------
//   const user =
//     typeof window !== "undefined"
//       ? JSON.parse(localStorage.getItem("user"))
//       : null;
//   // 👆 Logged-in user object (client-side only)

//   const localUserId = user?._id;
//   // 👆 Extract userId for booking payload

//   /* ---------------- LOAD BOOKING SUMMARY ---------------- */
//   useEffect(() => {
//     // Get booking summary data stored in previous step
//     const stored = sessionStorage.getItem("bookingSummary");

//     // If no booking data exists, redirect to home
//     if (!stored) {
//       router.replace("/");
//       return;
//     }

//     // Parse and store booking summary
//     setData(JSON.parse(stored));
//   }, [router]);

//   // Prevent rendering until data is available
//   if (!data) return null;

//   // ---------------- DESTRUCTURE BOOKING DATA ----------------
//   const { shop, groomer, services, date, time, totalPrice, userId } = data;
//   // 👆 Booking information prepared in previous steps

//   /* ---------------- CONFIRM BOOKING ---------------- */
//   const handleConfirmBooking = async () => {
//     try {
//       // If user is not logged in
//       if (!localUserId) {
//         alert("Please login to continue");
//         return;
//       }

//       setSubmitting(true);
//       // 👆 Show loading animation

//       const user = JSON.parse(localStorage.getItem("user"));

//       // Extra safety check
//       if (!user?._id) {
//         alert("User not logged in");
//         return;
//       }

//       // ---------------- PAYLOAD ----------------
//       const payload = {
//         shopId: shop._id,                // selected shop
//         userId: localUserId,             // logged-in user
//         groomerId: groomer._id,           // selected groomer
//         serviceIds: services.map((s) => s._id), // selected services
//         date: new Date(date).toISOString(),     // appointment date
//         time,                             // appointment time
//         price: Number(totalPrice),        // total price
//         status: "active",                 // initial booking status
//       };

//       // ---------------- API CALL ----------------
//      const res = await fetch(`/api/proxy`, {
//   method: "POST",
//   headers: {
//     "Content-Type": "application/json",
//   },
//   body: JSON.stringify({ endpoint: "postAppointment", ...payload }),
// });

//       const result = await res.json();

//       // If booking fails
//       if (!result.success) {
//         alert(result.message || "Booking failed");
//         setSubmitting(false);
//         return;
//       }

//       // ---------------- SUCCESS FLOW ----------------
//       sessionStorage.removeItem("bookingSummary");
//       // 👆 Clear temporary booking data

//       setShowSuccess(true);
//       // 👆 Show success animation

//       setTimeout(() => {
//         router.push("/pages/newUser");
//         // 👆 Redirect user to dashboard / home
//       }, 2000);
//     } catch (err) {
//       console.error("Booking error:", err);
//       alert("Something went wrong");
//       setSubmitting(false);
//     }
//   };

//   /* ---------------- LOADING STATES ---------------- */
//   // Show loader while submitting
//   if (submitting && !showSuccess) return <LottieLoader />;

//   // Show success animation
//   if (showSuccess) return <SuccessLottie />;

//   /* ---------------- UI ---------------- */
//   return (
//     <div className="min-h-screen bg-white p-5 pb-28">
//       {/* Page Title */}
//       <h1 className="text-xl font-semibold mb-5 text-black mt-14">
//         Booking Summary
//       </h1>

//       {/* ---------------- SHOP DETAILS ---------------- */}
//       <div className="bg-white rounded-xl border border-gray-300 p-4 mb-4 flex items-center gap-4">
//         <div className="relative w-16 h-16 rounded-xl overflow-hidden">
//           <Image
//             src={shop.shopImage || "/shop-placeholder.png"}
//             alt={shop.shopName}
//             fill
//             className="object-cover"
//           />
//         </div>

//         <div className="flex-1">
//           <p className="font-semibold text-black">{shop.shopName}</p>
//           <p className="text-sm text-gray-500">{shop.shopMobile}</p>
//           <p className="text-sm text-gray-500">{shop.shopLocation}</p>
//         </div>
//       </div>

//       {/* ---------------- GROOMER DETAILS ---------------- */}
//       <div className="bg-white rounded-xl border border-gray-300 p-4 mb-4 flex items-center gap-4">
//         <Image
//           src={groomer.profileImage}
//           alt={groomer.name}
//           width={60}
//           height={60}
//           className="rounded-full"
//         />
//         <div>
//           <p className="font-semibold text-black">{groomer.name}</p>
//           <p className="text-gray-500 text-sm">{groomer.department}</p>
//           <p className="text-sm text-yellow-500 font-medium">
//             ⭐ {groomer.rating || "N/A"}
//           </p>
//         </div>
//       </div>

//       {/* ---------------- APPOINTMENT DETAILS ---------------- */}
//       <div className="bg-white rounded-xl border border-gray-300 p-5 mb-4">
//         <h3 className="text-lg font-semibold text-gray-900 mb-4">
//           Appointment Details
//         </h3>

//         <div className="flex justify-between">
//           {/* Date */}
//           <div>
//             <p className="text-sm text-gray-500 mb-1">Date</p>
//             {date && (
//               <>
//                 <span className="block font-semibold text-gray-800">
//                   {new Date(date).toLocaleDateString("en-US", {
//                     weekday: "long",
//                   })}
//                 </span>
//                 <span className="block text-gray-800">
//                   {new Date(date).toLocaleDateString("en-US", {
//                     day: "numeric",
//                     month: "long",
//                     year: "numeric",
//                   })}
//                 </span>
//               </>
//             )}
//           </div>

//           {/* Time */}
//           <div>
//             <p className="text-sm text-gray-500">Time</p>
//             <p className="font-semibold text-gray-800">{time}</p>
//           </div>
//         </div>
//       </div>

//       {/* ---------------- SERVICES ---------------- */}
//       <div className="bg-white rounded-xl border border-gray-300 p-5 mb-6">
//         <h2 className="flex items-center text-lg text-black font-semibold mb-4">
//           <Scissors className="w-5 h-5 mr-2" />
//           Service Booked
//         </h2>

//         {/* Service list */}
//         <div className="space-y-3 mb-4">
//           {services.map((s) => (
//             <div key={s._id} className="flex justify-between">
//               <span className="text-gray-700">{s.serviceName}</span>
//               <span className="font-medium text-gray-700">
//                 ₹{s.displayPrice}
//               </span>
//             </div>
//           ))}
//         </div>

//         {/* Total price */}
//         <div className="flex justify-between border-t border-gray-300 pt-3">
//           <span className="font-semibold text-black">Total Amount</span>
//           <span className="text-lg text-black font-bold">₹{totalPrice}</span>
//         </div>
//       </div>

//       {/* ---------------- CONFIRM BUTTON ---------------- */}
//       <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4">
//         <button
//           onClick={handleConfirmBooking}
//           disabled={submitting}
//           className="w-full py-3 rounded-xl font-semibold bg-black text-green-500 transition"
//         >
//           Confirm Booking
//         </button>
//       </div>
//     </div>
//   );
// }

// //  Optimize code

"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Scissors } from "lucide-react";
import LottieLoader from "@/app/utils/loading";
import SuccessLottie from "@/app/utils/done";

// ✅ Read user once at module level helper (avoids repeated JSON.parse on every render)
const getStoredUser = () => {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

// ✅ Date formatting extracted to avoid repeated Date object creation in JSX
const formatDate = (date) => {
  const d = new Date(date);
  return {
    weekday: d.toLocaleDateString("en-US", { weekday: "long" }),
    full: d.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
  };
};

export default function BookingSummaryPage() {
  const router = useRouter();

  const [data, setData] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [bookingStatus, setBookingStatus] = useState("idle");
  useEffect(() => {
    const stored = sessionStorage.getItem("bookingSummary");
    if (!stored) {
      router.replace("/");
      return;
    }
    setData(JSON.parse(stored));
  }, [router]);

  // ✅ useCallback prevents recreation on every render

  const handleConfirmBooking = useCallback(async () => {
    // Prevent duplicate booking requests
    if (bookingStatus !== "idle") return;

    const user = getStoredUser();

    if (!user?._id) {
      alert("Please login to continue");
      return;
    }

    setBookingStatus("submitting");

    try {
      const { shop, groomer, services, date, time, totalPrice } = data;

      const res = await fetch("/api/proxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpoint: "postAppointment",
          shopId: shop._id,
          userId: user._id,
          groomerId: groomer._id,
          serviceIds: services.map((s) => s._id),
          date: new Date(date).toISOString(),
          time,
          price: Number(totalPrice),
          status: "active",
        }),
      });

      const result = await res.json();

      // Show success ONLY after confirmed API success
      if (!res.ok || !result.success) {
        setBookingStatus("idle");
        alert(result.message || "Booking failed");
        return;
      }

      // Clear summary only after successful booking
      sessionStorage.removeItem("bookingSummary");

      // Now show success animation
      setBookingStatus("success");

      setTimeout(() => {
        router.push("/pages/newUser");
      }, 2000);
    } catch (error) {
      // console.error("Booking error:", error);
      setBookingStatus("idle");
      alert("Something went wrong. Please try again.");
    }
  }, [data, router, bookingStatus]);

  if (!data) return null;

  if (bookingStatus === "submitting") {
    return <LottieLoader />;
  }

  if (bookingStatus === "success") {
    return <SuccessLottie />;
  }

  const { shop, groomer, services, date, time, totalPrice } = data;
  // ✅ Compute formatted date once, not three times in JSX
  const formattedDate = date ? formatDate(date) : null;

  return (
    <div className="min-h-screen bg-white p-5 pb-28">
      <h1 className="text-xl font-semibold mb-5 text-black mt-14">
        Booking Summary
      </h1>

      {/* Shop */}
      <div className="bg-white rounded-xl border border-gray-300 p-4 mb-4 flex items-center gap-4">
        <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
          <Image
            src={shop.shopImage || "/shop.jpg"}
            alt={shop.shopName}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-black truncate">{shop.shopName}</p>
          <p className="text-sm text-gray-500">{shop.shopMobile}</p>
          <p className="text-sm text-gray-500 truncate">{shop.shopLocation}</p>
        </div>
      </div>

      {/* Groomer */}
      <div className="bg-white rounded-xl border border-gray-300 p-4 mb-4 flex items-center gap-4">
        <Image
          src={groomer.profileImage}
          alt={groomer.name}
          width={60}
          height={60}
          className="rounded-full flex-shrink-0"
        />
        <div>
          <p className="font-semibold text-black">{groomer.name}</p>
          <p className="text-gray-500 text-sm">{groomer.department}</p>
        </div>
      </div>

      {/* Appointment */}
      <div className="bg-white rounded-xl border border-gray-300 p-5 mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Appointment Details
        </h3>
        <div className="flex justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Date</p>
            {formattedDate && (
              <>
                <span className="block font-semibold text-gray-800">
                  {formattedDate.weekday}
                </span>
                <span className="block text-gray-800">
                  {formattedDate.full}
                </span>
              </>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-500">Time</p>
            <p className="font-semibold text-gray-800">{time}</p>
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="bg-white rounded-xl border border-gray-300 p-5 mb-6">
        <h2 className="flex items-center text-lg text-black font-semibold mb-4">
          <Scissors className="w-5 h-5 mr-2" />
          Service Booked
        </h2>
        <div className="space-y-3 mb-4">
          {services.map((s) => (
            <div key={s._id} className="flex justify-between">
              <span className="text-gray-700">{s.serviceName}</span>
              <span className="font-medium text-gray-700">
                ₹{s.displayPrice}
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-between border-t border-gray-300 pt-3">
          <span className="font-semibold text-black">Total Amount</span>
          <span className="text-lg text-black font-bold">₹{totalPrice}</span>
        </div>
      </div>

      {/* Confirm */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4">
        <button
          onClick={handleConfirmBooking}
          disabled={bookingStatus !== "idle"}
          className="w-full py-3 rounded-xl font-semibold bg-black text-green-500 transition disabled:opacity-50"
        >
          {bookingStatus === "submitting" ? "Booking..." : "Confirm Booking"}
        </button>
      </div>
    </div>
  );
}
