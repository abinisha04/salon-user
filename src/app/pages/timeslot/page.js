// // Before Optimize code

// "use client";
// // 👆 Marks this file as a Client Component so hooks, browser APIs,
// // sessionStorage, and navigation can be used

// import { useEffect, useMemo, useState } from "react";
// // 👆 React hooks for lifecycle, memoization, and state

// import { useRouter } from "next/navigation";
// // 👆 Next.js router for navigation

// import Image from "next/image";
// // 👆 Optimized image component

// import { ChevronDown } from "lucide-react";
// // 👆 Icon for expandable groomer card

// import LottieLoader from "@/app/utils/loading";
// // 👆 Loading animation while fetching data

// import dayjs from "dayjs";
// // 👆 Date utility library

// import utc from "dayjs/plugin/utc";
// import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
// import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
// import isBetween from "dayjs/plugin/isBetween";
// // 👆 Dayjs plugins for accurate date comparisons

// // Extend dayjs with required plugins
// dayjs.extend(utc);
// dayjs.extend(isSameOrAfter);
// dayjs.extend(isSameOrBefore);
// dayjs.extend(isBetween);

// export default function TimeslotPage() {
//   // ---------------- ROUTER ----------------
//   const router = useRouter();
//   // 👆 Used to navigate between pages

//   // ---------------- ENV VARIABLES ----------------
//   const shopId = process.env.NEXT_PUBLIC_SHOP_ID;
//   // 👆 Current shop ID

//   // const backendUrl = process.env.BACKEND_URL;
//   // 👆 Backend API base URL

//   // const authKey = process.env.AUTH_KEY;
//   // 👆 Auth key for secured API requests

//   // ---------------- STATE ----------------
//   const [groomerData, setGroomerData] = useState(null);
//   // 👆 Selected groomer details

//   const [serviceData, setServiceData] = useState([]);
//   // 👆 Selected services

//   const [shopData, setShopData] = useState(null);
//   // 👆 Shop opening hours and info

//   const [leaves, setLeaves] = useState([]);
//   // 👆 Shop & groomer leave data

//   const [bookedTimes, setBookedTimes] = useState([]);
//   // 👆 Already booked time slots for selected date

//   const [loading, setLoading] = useState(true);
//   // 👆 Global loading state

//   const [isOpen, setIsOpen] = useState(false);
//   // 👆 Expand / collapse groomer card

//   const [selectedDate, setSelectedDate] = useState(null);
//   // 👆 Selected appointment date

//   const [selectedTime, setSelectedTime] = useState(null);
//   // 👆 Selected appointment time

//   const [isReschedule, setIsReschedule] = useState(false);
//   // 👆 True when rescheduling an existing appointment

//   const [appointmentId, setAppointmentId] = useState(null);
//   // 👆 Appointment ID (used during reschedule)

//   const [leaveType, setLeaveType] = useState(null);
//   // 👆 "shop" or "groomer" to display correct leave message

//   /* ---------- HELPER FUNCTIONS ---------- */

//   // Convert Date → YYYY-MM-DD (local)
//   const toYMD = (date) => {
//     const d = new Date(date);
//     return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
//       2,
//       "0",
//     )}-${String(d.getDate()).padStart(2, "0")}`;
//   };

//   // Normalize any date to UTC start of day
//   const normalizeUTC = (date) => dayjs.utc(date).startOf("day");

//   /* ---------- LOAD SESSION DATA ---------- */
//   useEffect(() => {
//     // Normal booking flow
//     const booking = sessionStorage.getItem("bookingData");
//     if (booking) {
//       const { groomer, services } = JSON.parse(booking);
//       setGroomerData(groomer);
//       setServiceData(services);
//     }

//     // Reschedule flow
//     const reschedule = sessionStorage.getItem("rescheduleBooking");
//     if (reschedule) {
//       const r = JSON.parse(reschedule);
//       setIsReschedule(true);
//       setAppointmentId(r.appointmentId);
//       setGroomerData(r.groomer);
//       setServiceData(r.services);
//       setSelectedDate(new Date(r.date));
//       setSelectedTime(r.time);
//     }
//   }, []);

//   /* ---------- FETCH SHOP DATA & LEAVES ---------- */
//   useEffect(() => {
//     if (!groomerData) return;

//     const fetchData = async () => {
//       try {
//         // Fetch shop info and leave data in parallel
//        const [shopRes, leaveRes] = await Promise.all([
//   fetch(`/api/proxy?endpoint=getShop&shopId=${shopId}`),
//   fetch(`/api/proxy?endpoint=getLeave&shopId=${shopId}`),
// ]);

//         const shopJson = await shopRes.json();
//         const leaveJson = await leaveRes.json();

//         // Save shop data
//         if (shopJson.success) setShopData(shopJson.shops?.[0]);

//         // Filter only valid (future or current) leaves
//         if (leaveJson.success) {
//           const todayUTC = normalizeUTC(new Date());

//           const validLeaves = (leaveJson.leaves || []).filter((leave) => {
//             const endUTC = normalizeUTC(leave.endDate);
//             return endUTC.isSameOrAfter(todayUTC, "day");
//           });

//           setLeaves(validLeaves);
//         }
//       } catch (e) {
//         console.error(e);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [groomerData]);

//   /* ---------- DATE LIST (TODAY + NEXT 3 DAYS) ---------- */
//   const dateList = useMemo(() => {
//     const todayUTC = normalizeUTC(new Date());

//     return Array.from({ length: 4 }, (_, i) =>
//       todayUTC.add(i, "day").toDate(),
//     );
//   }, []);

//   /* ---------- CHECK IF SELECTED DATE IS ON LEAVE ---------- */
//   const isOnLeave = useMemo(() => {
//     if (!selectedDate || !leaves.length || !groomerData) {
//       setLeaveType(null);
//       return false;
//     }

//     const selectedUTC = normalizeUTC(selectedDate);

//     for (const leave of leaves) {
//       const startUTC = normalizeUTC(leave.startDate);
//       const endUTC = normalizeUTC(leave.endDate);

//       // Inclusive date range check
//       const inRange = selectedUTC.isBetween(
//         startUTC,
//         endUTC,
//         "day",
//         "[]",
//       );

//       if (!inRange) continue;

//       // Shop leave
//       if (leave.isShop) {
//         setLeaveType("shop");
//         return true;
//       }

//       // Groomer-specific leave
//       if (
//         !leave.isShop &&
//         String(leave.groomerId?._id || leave.groomerId) ===
//           String(groomerData._id)
//       ) {
//         setLeaveType("groomer");
//         return true;
//       }
//     }

//     setLeaveType(null);
//     return false;
//   }, [selectedDate, leaves, groomerData]);

//   /* ---------- FETCH BOOKED TIMES FOR SELECTED DATE ---------- */
//   useEffect(() => {
//     if (!selectedDate || !groomerData) {
//       setBookedTimes([]);
//       return;
//     }

//     const ymd = toYMD(selectedDate);

//     // fetch(
//     //   `${backendUrl}/api/getAppointment?shopId=${shopId}&groomerId=${groomerData._id}&status=active,confirmed&date=${ymd}`,
//     //   { headers: { "x-auth-key": authKey } },
//     // )
//     fetch(
//   `/api/proxy?endpoint=getAppointment&shopId=${shopId}&groomerId=${groomerData._id}&status=active,confirmed&date=${ymd}`
// )
//       .then((r) => r.json())
//       .then((d) =>
//         setBookedTimes(d.success ? d.appointments.map((a) => a.time) : []),
//       );
//   }, [selectedDate, groomerData]);

//   /* ---------- GENERATE TIME SLOTS ---------- */
//   const timeSlots = useMemo(() => {
//     if (!selectedDate || !shopData || isOnLeave) return [];

//     // Find opening hours for selected weekday
//     const dayName = selectedDate.toLocaleDateString("en-US", {
//       weekday: "long",
//     });
//     const day = shopData.openingHours.find((d) => d.day === dayName);
//     if (!day) return [];

//     // Convert time string → minutes
//     const toMin = (t) => {
//       let [time, m] = t.split(" ");
//       let [h, mi] = time.split(":").map(Number);
//       if (m === "PM" && h !== 12) h += 12;
//       if (m === "AM" && h === 12) h = 0;
//       return h * 60 + mi;
//     };

//     // Convert minutes → 12-hour time
//     const to12 = (m) => {
//       let h = Math.floor(m / 60);
//       let mi = m % 60;
//       const ap = h >= 12 ? "PM" : "AM";
//       h = h % 12 || 12;
//       return `${h}:${mi.toString().padStart(2, "0")} ${ap}`;
//     };

//     let start = toMin(day.open);
//     const end = toMin(day.close);

//     // Prevent showing past slots for today
//     const now = new Date();
//     if (toYMD(selectedDate) === toYMD(now)) {
//       const current = now.getHours() * 60 + now.getMinutes();
//       start = Math.max(start, Math.ceil(current / 30) * 30);
//     }

//     if (start >= end) return [];

//     // Generate 30-minute slots
//     const slots = [];
//     while (start + 30 <= end) {
//       slots.push(to12(start));
//       start += 30;
//     }

//     return slots;
//   }, [selectedDate, shopData, isOnLeave]);

//   // Calculate total service price
//   const totalPrice = serviceData.reduce((s, x) => s + x.displayPrice, 0);

//   /* ---------- LOADING ---------- */
//   if (loading) return <LottieLoader />;

//   /* ---------- CONTINUE / RESCHEDULE ---------- */
//   const handleContinue = async () => {
//     // Reschedule existing appointment
//     if (isReschedule) {
//       // await fetch(`${backendUrl}/api/putAppointment`, {
//       //   method: "PUT",
//       //   headers: {
//       //     "Content-Type": "application/json",
//       //     "x-auth-key": authKey,
//       //   },
//       //   body: JSON.stringify({
//       //     appointmentId,
//       //     date: selectedDate.toISOString(),
//       //     time: selectedTime,
//       //     status: "active",
//       //   }),
//       // });
// await fetch(`/api/proxy`, {
//   method: "PUT",
//   headers: { "Content-Type": "application/json" },
//   body: JSON.stringify({
//     endpoint: "putAppointment",
//     appointmentId,
//     date: selectedDate.toISOString(),
//     time: selectedTime,
//     status: "active",
//   }),
// });
//       sessionStorage.removeItem("rescheduleBooking");
//       router.push("/pages/bookingHistory");
//       return;
//     }

//     // New booking → store summary
//     sessionStorage.setItem(
//       "bookingSummary",
//       JSON.stringify({
//         shop: shopData,
//         groomer: groomerData,
//         services: serviceData,
//         date: selectedDate,
//         time: selectedTime,
//         totalPrice,
//       }),
//     );

//     router.push("/pages/bookingSummary");
//   };

//   /* ------------------------ UI ------------------------ */
//   return (
//     <div className="p-6 bg-white min-h-screen pb-28">
//       <h1 className="text-xl font-semibold mb-4 mt-16 text-black">
//         Time Slot Booking
//       </h1>

//       {/* GROOMER CARD */}
//       <div className="border rounded-xl border-gray-300 mb-6 overflow-hidden">
//         <div
//           className="flex justify-between p-4 items-center cursor-pointer"
//           onClick={() => setIsOpen(!isOpen)}
//         >
//           <div className="flex items-center gap-4">
//             <Image
//               src={groomerData.profileImage}
//               alt={groomerData.name}
//               width={70}
//               height={70}
//               className="rounded-full"
//             />
//             <div>
//               <p className="font-semibold text-black">{groomerData.name}</p>
//               <p className="text-gray-500 text-sm">{groomerData.department}</p>
//               {/* <p className="text-yellow-500 font-semibold text-sm"> Rating: {groomerData.rating || "N/A"} </p> */}
//             </div>
//           </div>
//           <div className="flex items-center gap-2">
//             <p className="font-semibold text-black">₹{totalPrice}</p>
//             <ChevronDown
//               className={`w-6 h-6 text-gray-500 transform transition-transform duration-300 ${
//                 isOpen ? "rotate-180" : ""
//               }`}
//             />
//           </div>
//         </div>

//         <div
//           className={`transition-max-height duration-300 ease-in-out overflow-hidden ${
//             isOpen ? "max-h-96 p-4" : "max-h-0"
//           }`}
//         >
//           <h3 className="font-semibold text-black mb-2">Selected Services:</h3>{" "}
//           <ul className="list-disc list-inside text-gray-700 space-y-1">
//             {" "}
//             {serviceData.map((service) => (
//               <li
//                 key={service._id}
//                 className="text-gray-500 text-sm font-normal"
//               >
//                 {" "}
//                 {service.serviceName} — ₹{service.displayPrice}{" "}
//               </li>
//             ))}{" "}
//           </ul>
//         </div>
//       </div>

//       {/* DATE SELECT */}
//       <h2 className="font-semibold text-lg text-gray-800  mb-2">Select Date</h2>
//       {/* DATE SELECT */}
//       <div className="mb-6 p-4 border rounded-xl border-gray-300 bg-white">
//         {/* Current Month & Year */}
//         <div className="text-center mb-3 text-gray-700 font-semibold">
//           {selectedDate
//             ? selectedDate
//                 .toLocaleString("en-US", { month: "short", year: "numeric" })
//                 .toUpperCase()
//             : new Date()
//                 .toLocaleString("en-US", { month: "short", year: "numeric" })
//                 .toUpperCase()}
//         </div>

//         {/* Dates */}
// <div className="flex gap-3 justify-center">
//   {dateList.map((d) => {
//     const dayNumber = dayjs.utc(d).date();
//     const dayName = dayjs.utc(d).format("ddd").toUpperCase();

//     const isSelected =
//       selectedDate &&
//       dayjs.utc(selectedDate).isSame(dayjs.utc(d), "day");

//     return (
//       <button
//         key={d.toISOString()}
//         onClick={() => {
//           setSelectedDate(d);
//           setSelectedTime(null);
//         }}
//         className={`w-18 h-20 rounded-xl border flex flex-col items-center justify-center transition-colors duration-200 ${
//           isSelected ? "bg-black" : "bg-white hover:bg-gray-100"
//         }`}
//       >
//         <span
//           className={`text-lg font-semibold ${
//             isSelected ? "text-green-500" : "text-gray-600"
//           }`}
//         >
//           {dayNumber}
//         </span>

//         <span
//           className={`text-sm ${
//             isSelected ? "text-green-500" : "text-gray-500"
//           }`}
//         >
//           {dayName}
//         </span>
//       </button>
//     );
//   })}
// </div>

//       </div>

//       {/* LEAVE MESSAGE */}
//       {isOnLeave && (
//         <div className="p-4 mb-4 border border-red-300 bg-red-50 rounded-lg text-sm text-red-700">
//           {leaveType === "shop"
//             ? "Shop is closed on this day. Please select another date."
//             : "Stylist is on leave for this day. Please select another date."}
//         </div>
//       )}

//   {!isOnLeave && selectedDate && timeSlots.length === 0 && (
//         <div className="p-4 mb-4 border border-yellow-300 bg-yellow-50 rounded-lg text-sm text-yellow-800">
//           No slots available for this day. Please try another date.
//         </div>
//       )}

//       {/* TIME SLOTS */}
//       {!isOnLeave && selectedDate && (
//         <>
//           <h2 className="font-semibold mb-3 text-lg text-gray-800">
//             Select Time
//           </h2>

//           <div className="grid grid-cols-4 gap-3">
//             {timeSlots.map((t) => {
//               const isBooked =
//                 bookedTimes.includes(t) &&
//                 !(isReschedule && t === selectedTime);
//               const isSelected = selectedTime === t;

//               return (
//                 <button
//                   key={t}
//                   onClick={() => {
//                     if (isBooked) {
//                       alert(
//                         "This time is already booked. Please select another time.",
//                       );
//                       return;
//                     }
//                     setSelectedTime(t);
//                   }}
//                   disabled={isBooked}
//                   className={`w-20 h-12 rounded-lg border text-sm font-medium transition-all duration-200 flex items-center justify-center
//               ${
//                 isSelected
//                   ? "bg-black text-green-500 border-black"
//                   : isBooked
//                     ? "bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed"
//                     : "bg-white text-gray-700 border-gray-200"
//               }
//             `}
//                 >
//                   {t}
//                 </button>
//               );
//             })}
//           </div>
//         </>
//       )}

//       {/* CONTINUE BUTTON */}
//       <div className="fixed bottom-0 left-0 w-full p-4 bg-white border-t border-gray-300">
//         <button
//           onClick={handleContinue}
//           disabled={!selectedDate || !selectedTime || isOnLeave}
//           className={`w-full p-3 rounded-lg font-semibold ${
//             selectedDate && selectedTime && !isOnLeave
//               ? "bg-black text-green-500"
//               : "bg-gray-300 text-gray-500"
//           }`}
//         >
//           {isReschedule ? "Reschedule Appointment" : "Continue"}
//         </button>
//       </div>
//     </div>
//   );
// }

//Optimize code

"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import LottieLoader from "@/app/utils/loading";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(utc);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(isBetween);

// ✅ Module-level constants
const SHOP_ID = process.env.NEXT_PUBLIC_SHOP_ID;

// ✅ Extracted pure helpers — not recreated on render
const toYMD = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const normalizeUTC = (date) => dayjs.utc(date).startOf("day");

const toMin = (t) => {
  const [time, m] = t.split(" ");
  let [h, mi] = time.split(":").map(Number);
  if (m === "PM" && h !== 12) h += 12;
  if (m === "AM" && h === 12) h = 0;
  return h * 60 + mi;
};

const to12 = (m) => {
  const h = Math.floor(m / 60) % 12 || 12;
  const mi = m % 60;
  const ap = Math.floor(m / 60) >= 12 ? "PM" : "AM";
  return `${h}:${mi.toString().padStart(2, "0")} ${ap}`;
};

export default function TimeslotPage() {
  const router = useRouter();

  const [groomerData, setGroomerData] = useState(null);
  const [serviceData, setServiceData] = useState([]);
  const [shopData, setShopData] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [bookedTimes, setBookedTimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [isReschedule, setIsReschedule] = useState(false);
  const [appointmentId, setAppointmentId] = useState(null);
  const [leaveType, setLeaveType] = useState(null);

  const [today] = useState(() => new Date());

  // Load session data
  // Load session data
  useEffect(() => {
    const reschedule = sessionStorage.getItem("rescheduleBooking");

    if (reschedule) {
      const r = JSON.parse(reschedule);

      setIsReschedule(true);
      setAppointmentId(r.appointmentId);
      setGroomerData(r.groomer);
      setServiceData(r.services);
      setSelectedDate(new Date(r.date));
      setSelectedTime(r.time);

      return;
    }

    // Normal new booking
    setIsReschedule(false);
    setAppointmentId(null);

    // Important: Reset previous reschedule selections
    setSelectedDate(null);
    setSelectedTime(null);

    const booking = sessionStorage.getItem("bookingData");

    if (booking) {
      const { groomer, services } = JSON.parse(booking);

      setGroomerData(groomer);
      setServiceData(services);
    }
  }, []);

  // Fetch shop + leaves
  useEffect(() => {
    if (!groomerData || !today) return;

    const fetchData = async () => {
      try {
        const [shopRes, leaveRes] = await Promise.all([
          fetch(`/api/proxy?endpoint=getShop&shopId=${SHOP_ID}`),
          fetch(`/api/proxy?endpoint=getLeave&shopId=${SHOP_ID}`),
        ]);

        // ✅ Parse in parallel
        const [shopJson, leaveJson] = await Promise.all([
          shopRes.json(),
          leaveRes.json(),
        ]);

        if (shopJson.success) setShopData(shopJson.shops?.[0]);

        if (leaveJson.success) {
          const todayUTC = normalizeUTC(today);
          const validLeaves = (leaveJson.leaves || []).filter((leave) =>
            normalizeUTC(leave.endDate).isSameOrAfter(todayUTC, "day"),
          );
          setLeaves(validLeaves);
        }
      } catch (e) {
        // console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [groomerData, today]);

  // Date list: today + next 3 days — stable since no deps change
  // Date list: today + next 3 days
  const dateList = useMemo(() => {
    if (!today) return [];

    const todayUTC = normalizeUTC(today);

    return Array.from({ length: 4 }, (_, i) => todayUTC.add(i, "day").toDate());
  }, [today]);

  // Check leave status — also sets leaveType as side effect
  const isOnLeave = useMemo(() => {
    if (!selectedDate || !leaves.length || !groomerData) {
      setLeaveType(null);
      return false;
    }

    const selectedUTC = normalizeUTC(selectedDate);

    for (const leave of leaves) {
      const inRange = selectedUTC.isBetween(
        normalizeUTC(leave.startDate),
        normalizeUTC(leave.endDate),
        "day",
        "[]",
      );
      if (!inRange) continue;

      if (leave.isShop) {
        setLeaveType("shop");
        return true;
      }
      if (
        String(leave.groomerId?._id || leave.groomerId) ===
        String(groomerData._id)
      ) {
        setLeaveType("groomer");
        return true;
      }
    }

    setLeaveType(null);
    return false;
  }, [selectedDate, leaves, groomerData]);

  // Fetch booked times when date or groomer changes
  useEffect(() => {
    if (!selectedDate || !groomerData) {
      setBookedTimes([]);
      return;
    }

    fetch(
      `/api/proxy?endpoint=getAppointment&shopId=${SHOP_ID}&groomerId=${groomerData._id}&status=active,confirmed&date=${toYMD(selectedDate)}`,
    )
      .then((r) => r.json())
      .then((d) =>
        setBookedTimes(d.success ? d.appointments.map((a) => a.time) : []),
      );
  }, [selectedDate, groomerData]);

  useEffect(() => {
    const handleBack = () => {
      if (sessionStorage.getItem("rescheduleBooking")) {
        sessionStorage.removeItem("rescheduleBooking");

        router.replace("/pages/bookingHistory?closeBooking=true");
      }
    };

    window.addEventListener("popstate", handleBack);

    return () => {
      window.removeEventListener("popstate", handleBack);
    };
  }, [router]);

  // Generate time slots
  const timeSlots = useMemo(() => {
    if (!selectedDate || !shopData || isOnLeave) return [];

    const dayName = selectedDate.toLocaleDateString("en-US", {
      weekday: "long",
    });
    const day = shopData.openingHours.find((d) => d.day === dayName);
    if (!day) return [];

    let start = toMin(day.open);
    const end = toMin(day.close);

    // Trim past slots for today
    if (toYMD(selectedDate) === toYMD(new Date())) {
      const now = new Date();
      const current = now.getHours() * 60 + now.getMinutes();
      start = Math.max(start, Math.ceil(current / 30) * 30);
    }

    if (start >= end) return [];

    const slots = [];
    for (let t = start; t + 30 <= end; t += 30) {
      slots.push(to12(t));
    }
    return slots;
  }, [selectedDate, shopData, isOnLeave]);

  // ✅ useMemo — not recomputed unless serviceData changes
  const totalPrice = useMemo(
    () => serviceData.reduce((s, x) => s + x.displayPrice, 0),
    [serviceData],
  );

  const handleDateSelect = useCallback((d) => {
    setSelectedDate(d);
    setSelectedTime(null);
  }, []);

  const handleTimeSelect = useCallback((t, isBooked) => {
    if (isBooked) {
      alert("This time is already booked. Please select another time.");
      return;
    }
    setSelectedTime(t);
  }, []);

  const handleContinue = useCallback(async () => {
    if (isReschedule) {
      try {
        const response = await fetch("/api/proxy", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            endpoint: "putAppointment",
            appointmentId,
            date: selectedDate.toISOString(),
            time: selectedTime,
            status: "active",
          }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          alert(
            result.message ||
              "Unable to reschedule appointment. Please try again.",
          );
          return;
        }

        // Clear reschedule data only after successful API update
        sessionStorage.removeItem("rescheduleBooking");

        router.push("/pages/bookingHistory");
        return;
      } catch (error) {
        // console.error("Reschedule error:", error);
        alert("Something went wrong. Please try again.");
        return;
      }
    }

    sessionStorage.setItem(
      "bookingSummary",
      JSON.stringify({
        shop: shopData,
        groomer: groomerData,
        services: serviceData,
        date: selectedDate,
        time: selectedTime,
        totalPrice,
      }),
    );
    router.push("/pages/bookingSummary");
  }, [
    isReschedule,
    appointmentId,
    selectedDate,
    selectedTime,
    shopData,
    groomerData,
    serviceData,
    totalPrice,
    router,
  ]);

  if (loading || !today) return <LottieLoader />;

  const canContinue = selectedDate && selectedTime && !isOnLeave;

  return (
    <div className="p-6 bg-white min-h-screen pb-28">
      <h1 className="text-xl font-semibold mb-4 mt-16 text-black">
        Time Slot Booking
      </h1>

      {/* Groomer Card */}
      <div className="border rounded-xl border-gray-300 mb-6 overflow-hidden">
        <div
          className="flex justify-between p-4 items-center cursor-pointer"
          onClick={() => setIsOpen((o) => !o)}
        >
          <div className="flex items-center gap-4">
            <Image
              src={groomerData.profileImage}
              alt={groomerData.name}
              width={70}
              height={70}
              className="rounded-full"
            />
            <div>
              <p className="font-semibold text-black">{groomerData.name}</p>
              <p className="text-gray-500 text-sm">{groomerData.department}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-black">₹{totalPrice}</p>
            <ChevronDown
              className={`w-6 h-6 text-gray-500 transform transition-transform duration-300 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>

        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isOpen ? "max-h-96 p-4" : "max-h-0"
          }`}
        >
          <h3 className="font-semibold text-black mb-2">Selected Services:</h3>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            {serviceData.map((service) => (
              <li
                key={service._id}
                className="text-gray-500 text-sm font-normal"
              >
                {service.serviceName} — ₹{service.displayPrice}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Date Select */}
      <h2 className="font-semibold text-lg text-gray-800 mb-2">Select Date</h2>
      <div className="mb-6 p-4 border rounded-xl border-gray-300 bg-white">
        <div className="text-center mb-3 text-gray-700 font-semibold">
          {(selectedDate || today)
            .toLocaleString("en-US", { month: "short", year: "numeric" })
            .toUpperCase()}
        </div>

        <div className="flex gap-3 justify-center">
          {dateList.map((d) => {
            const dayNumber = dayjs.utc(d).date();
            const dayName = dayjs.utc(d).format("ddd").toUpperCase();
            const isSelected =
              selectedDate &&
              dayjs.utc(selectedDate).isSame(dayjs.utc(d), "day");

            return (
              <button
                key={d.toISOString()}
                onClick={() => handleDateSelect(d)}
                className={`w-18 h-20 rounded-xl border flex flex-col items-center justify-center transition-colors duration-200 ${
                  isSelected ? "bg-black" : "bg-white hover:bg-gray-100"
                }`}
              >
                <span
                  className={`text-lg font-semibold ${isSelected ? "text-green-500" : "text-gray-600"}`}
                >
                  {dayNumber}
                </span>
                <span
                  className={`text-sm ${isSelected ? "text-green-500" : "text-gray-500"}`}
                >
                  {dayName}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Leave / Empty messages */}
      {isOnLeave && (
        <div className="p-4 mb-4 border border-red-300 bg-red-50 rounded-lg text-sm text-red-700">
          {leaveType === "shop"
            ? "Shop is closed on this day. Please select another date."
            : "Stylist is on leave for this day. Please select another date."}
        </div>
      )}

      {!isOnLeave && selectedDate && timeSlots.length === 0 && (
        <div className="p-4 mb-4 border border-yellow-300 bg-yellow-50 rounded-lg text-sm text-yellow-800">
          No slots available for this day. Please try another date.
        </div>
      )}

      {/* Time Slots */}
      {!isOnLeave && selectedDate && timeSlots.length > 0 && (
        <>
          <h2 className="font-semibold mb-3 text-lg text-gray-800">
            Select Time
          </h2>
          <div className="grid grid-cols-4 gap-3">
            {timeSlots.map((t) => {
              const isBooked =
                bookedTimes.includes(t) &&
                !(isReschedule && t === selectedTime);
              const isSelected = selectedTime === t;

              return (
                <button
                  key={t}
                  onClick={() => handleTimeSelect(t, isBooked)}
                  disabled={isBooked}
                  className={`w-20 h-12 rounded-lg border text-sm font-medium transition-all duration-200 flex items-center justify-center ${
                    isSelected
                      ? "bg-black text-green-500 border-black"
                      : isBooked
                        ? "bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed"
                        : "bg-white text-gray-700 border-gray-200"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Continue Button */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-white border-t border-gray-300">
        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className={`w-full p-3 rounded-lg font-semibold transition ${
            canContinue
              ? "bg-black text-green-500"
              : "bg-gray-300 text-gray-500"
          }`}
        >
          {isReschedule ? "Reschedule Appointment" : "Continue"}
        </button>
      </div>
    </div>
  );
}
