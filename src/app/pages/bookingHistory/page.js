// // Before Optimize code

// "use client"
// import { useEffect, useState } from "react";
// import Image from "next/image";
// import { X, Clock, Calendar } from "lucide-react";
// import EmptyState from "@/app/utils/nothing";
// import { Modal } from "antd";
// import "@ant-design/v5-patch-for-react-19";
// import { useRouter } from "next/navigation";

// /* ✅ HELPER: date + time → full Date object */
// const getDateTime = (dateStr, timeStr) => {
//   const d = new Date(dateStr);

//   const [time, meridian] = timeStr.split(" ");
//   let [hours, minutes] = time.split(":").map(Number);

//   if (meridian === "PM" && hours !== 12) hours += 12;
//   if (meridian === "AM" && hours === 12) hours = 0;

//   d.setHours(hours, minutes, 0, 0);
//   return d;
// };

// export default function BookingHistoryPage() {
//   // const backendUrl = process.env.BACKEND_URL;
//   // const authKey = process.env.AUTH_KEY;
//   const router = useRouter();

//   const user =
//     typeof window !== "undefined"
//       ? JSON.parse(localStorage.getItem("user"))
//       : null;

//   const userId = user?._id;
//   const shopId = user?.shopId;

//   const [appointments, setAppointments] = useState([]);
//   const [activeTab, setActiveTab] = useState("live");
//   const [selectedBooking, setSelectedBooking] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [isClosing, setIsClosing] = useState(false);

//   // ---------------- FETCH ----------------
//   useEffect(() => {
//     if (!userId || !shopId) return;
// fetch(
//   `/api/proxy?endpoint=getAppointment&shopId=${shopId}&userId=${userId}&status=active,confirmed,completed,cancelled`
// )
//       .then((res) => res.json())
//       .then((data) => {
//         if (data.success) handleAutoCancel(data.appointments);
//         else setLoading(false);
//       });
//   }, []);

//   // ---------------- BACK BUTTON ----------------
//   useEffect(() => {
//     const handleBack = () => router.replace("/pages/newUser");
//     window.history.pushState(null, "", window.location.href);
//     window.addEventListener("popstate", handleBack);
//     return () => window.removeEventListener("popstate", handleBack);
//   }, [router]);

//   // ---------------- AUTO STATUS ----------------
//   const handleAutoCancel = async (list) => {
//     const now = new Date();
//     const oneDayAgo = new Date(now);
//     oneDayAgo.setDate(oneDayAgo.getDate() - 1);

//     const updated = [];

//     for (let appt of list) {
//       const appointmentDate = getDateTime(appt.date, appt.time);

//       let newStatus = appt.status;

//       if (appointmentDate < oneDayAgo) {
//         if (appt.status === "active") newStatus = "cancelled";
//         else if (appt.status === "confirmed") newStatus = "completed";
//       }

//       if (newStatus !== appt.status) {
//         try {
//          await fetch(`/api/proxy`, {
//   method: "PUT",
//   headers: {
//     "Content-Type": "application/json",
//   },
//   body: JSON.stringify({
//     endpoint: "putAppointment",
//     appointmentId: appt._id,   // ✅ use appt._id directly
//     status: newStatus,
//   }),
// });

//           appt.status = newStatus;
//         } catch (err) {
//           console.error("Failed to update appointment:", err);
//         }
//       }

//       updated.push(appt);
//     }

//     /* ❌ NO SORT HERE */
//     setAppointments(updated);
//     setLoading(false);
//   };

//   // ---------------- TAB FILTER + SORT ----------------

//   const sortByDateTimeAsc = (arr) => {
//     return [...arr].sort((a, b) => {
//       const d1 = getDateTime(a.date, a.time);
//       const d2 = getDateTime(b.date, b.time);
//       return d1 - d2; // earliest first
//     });
//   };

//   const liveConfirmed = appointments.filter((a) => a.status === "confirmed");
//   const liveActive = appointments.filter((a) => a.status === "active");
//   const completed = appointments.filter((a) => a.status === "completed");
//   const cancelled = appointments.filter((a) => a.status === "cancelled");

//   const getTabData = () => {
//     if (activeTab === "live")
//       return sortByDateTimeAsc([...liveConfirmed, ...liveActive]);

//     if (activeTab === "completed") return sortByDateTimeAsc(completed);
//     if (activeTab === "cancelled") return sortByDateTimeAsc(cancelled);

//     return [];
//   };

//   const list = getTabData();

//   // ---------------- LOADING ----------------
//   if (loading) return <p className="p-6">Loading...</p>;

//   // ---------------- CLOSE ----------------
//   const handleClose = () => {
//     setIsClosing(true);
//     setTimeout(() => {
//       setSelectedBooking(null);
//       setIsClosing(false);
//     }, 350);
//   };

//   // ---------------- CANCEL ----------------
//   const confirmCancelBooking = (booking) => {
//     Modal.confirm({
//       title: "Cancel Appointment?",
//       content: "Are you sure you want to cancel this appointment?",
//       okText: "Yes, Cancel",
//       cancelText: "No",
//       centered: true,
//       okButtonProps: { danger: true },
//       onOk: async () => {
//         // await fetch(`${backendUrl}/api/putAppointment`, {
//         //   method: "PUT",
//         //   headers: {
//         //     "Content-Type": "application/json",
//         //     "x-auth-key": authKey,
//         //   },
//         //   body: JSON.stringify({
//         //     appointmentId: booking._id,
//         //     status: "cancelled",
//         //   }),
//         // });
//         await fetch(`/api/proxy`, {
//   method: "PUT",
//   headers: { "Content-Type": "application/json" },
//   body: JSON.stringify({
//     endpoint: "putAppointment",
//     appointmentId: booking._id,
//     status: "cancelled",
//   }),
// });

//         setAppointments((prev) =>
//           prev.map((a) =>
//             a._id === booking._id ? { ...a, status: "cancelled" } : a
//           )
//         );

//         handleClose();
//       },
//     });
//   };

//   // ---------------- RESCHEDULE ----------------
//   const handleRescheduleConfirm = (booking) => {
//     Modal.confirm({
//       title: "Reschedule Appointment?",
//       content: "Do you want to reschedule this appointment?",
//       okText: "Yes, Reschedule",
//       cancelText: "No",
//       centered: true,
//       onOk: () => {
//         sessionStorage.setItem(
//           "rescheduleBooking",
//           JSON.stringify({
//             appointmentId: booking._id,
//             shopId,
//             groomer: booking.groomerId,
//             services: booking.serviceIds,
//             date: booking.date,
//             time: booking.time,
//           })
//         );

//         window.location.href = "/pages/timeslot";
//       },
//     });
//   };

//   /* ---------------- UI ---------------- */
//   return (
//     <div className="min-h-screen bg-white p-4 pb-24">
//       <h1 className="text-xl font-semibold mb-5 mt-16 text-black">
//         My Bookings
//       </h1>

//       {/* -------- TABS -------- */}
//       <div className="flex gap-3 mb-5">
//         {[
//           { key: "live", label: "LIVE" },
//           { key: "completed", label: "COMPLETED" },
//           { key: "cancelled", label: "CANCELLED" },
//         ].map((tab) => (
//           <button
//             key={tab.key}
//             onClick={() => setActiveTab(tab.key)}
//             className={`flex-1 py-2 rounded-full text-sm font-semibold border transition
//         ${
//           activeTab === tab.key
//             ? "bg-black text-green-500 border-black"
//             : "border-gray-300 text-gray-600 bg-white"
//         }`}
//           >
//             {tab.label}
//           </button>
//         ))}
//       </div>

//       {/* -------- EMPTY STATE -------- */}
//       {list.length === 0 && !loading && <EmptyState />}

//       <div className="space-y-4">
//         {list.map((a) => (
//           <div
//             key={a._id}
//             onClick={() => setSelectedBooking(a)}
//             className="relative bg-white border border-gray-200 rounded-xl p-4
//                  flex items-start gap-4 cursor-pointer
//                  transition hover:shadow-md hover:border-gray-300"
//           >
//             {/* STATUS DOT */}
//             <span
//               className={`absolute top-4 right-4 w-2.5 h-2.5 rounded-full
//           ${
//             a.status === "confirmed"
//               ? "bg-green-500"
//               : a.status === "active"
//                 ? "bg-yellow-500"
//                 : a.status === "completed"
//                   ? "bg-gray-400"
//                   : "bg-red-500"
//           }`}
//             />

//             {/* TOTAL PRICE (BOTTOM RIGHT) */}
//             <span className="absolute bottom-[40px] right-4 text-sm font-semibold text-gray-900">
//               ₹{a.price}
//             </span>

//             {/* GROOMER IMAGE (FIXED SIZE) */}
//             <div className="w-16 h-16 shrink-0">
//               <Image
//                 src={a.groomerId.profileImage}
//                 alt={a.groomerId.name}
//                 width={64}
//                 height={64}
//                 className="w-16 h-16 rounded-full object-cover"
//               />
//             </div>

//             {/* DETAILS */}
//             <div className="flex-1 min-w-0">
//               {/* Groomer Name */}
//               <p className="font-semibold text-gray-900 text-base leading-tight truncate">
//                 {a.groomerId.name}
//               </p>

//               {/* Services */}
//               <p className="text-sm text-gray-500 mt-1 line-clamp-1">
//                 {a.serviceIds.map((s) => s.serviceName).join(", ")}
//               </p>

//               {/* DATE & TIME (STACKED) */}
//               <div className="mt-3 space-y-1 text-sm text-gray-600">
//                 <div className="flex items-center gap-1.5">
//                   <Calendar className="w-4 h-4 text-gray-400" />
//                   <span>
//                     {new Date(a.date).toLocaleDateString("en-US", {
//                       weekday: "long",
//                       day: "numeric",
//                       month: "short",
//                       year: "numeric",
//                     })}
//                   </span>
//                 </div>

//                 <div className="flex items-center gap-1.5">
//                   <Clock className="w-4 h-4 text-gray-400" />
//                   <span>{a.time}</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {selectedBooking && (
//         <div className="fixed inset-0 z-50 flex items-end justify-center">
//           {/* Backdrop */}
//           <div
//             onClick={handleClose}
//             className={`absolute inset-0 bg-black/40 backdrop-blur-sm
//         transition-opacity duration-300
//         ${isClosing ? "opacity-0" : "opacity-100"}
//       `}
//           />

//           {/* Bottom Sheet */}
//           <div
//             className={`
//         relative w-full bg-white rounded-t-3xl
//         p-5 pb-8 max-h-[90vh] overflow-y-auto
//         transform
//         ${isClosing ? "animate-slideDown" : "animate-slideUp"}
//       `}
//           >
//             {/* Close Icon */}
//             <button
//               onClick={handleClose}
//               className="absolute top-4 right-4 p-2 rounded-full border border-gray-400 hover:bg-gray-100 transition"
//             >
//               <X className="w-5 h-5 text-gray-400" />
//             </button>

//             {/* Groomer Info */}
//             <div className="flex items-center gap-4 mb-6 mt-2">
//               <div className="w-18 h-18 rounded-full overflow-hidden ">
//                 <Image
//                   src={selectedBooking.groomerId.profileImage}
//                   width={72}
//                   height={72}
//                   className="rounded-full border"
//                   alt=""
//                 />
//               </div>

//               <div>
//                 <p className="text-lg font-semibold text-black">
//                   {selectedBooking.groomerId.name}
//                 </p>
//                 <p className="text-sm text-gray-500">
//                   {selectedBooking.groomerId.department}
//                 </p>
//               </div>
//             </div>

//             {/* Date & Time */}
//             <div className="grid grid-cols-2 gap-4 mb-5">
//               <div className="border border-gray-300 rounded-xl p-4 space-y-1">
//                 <div className="flex items-center gap-2 text-gray-500 text-sm">
//                   <Calendar className="w-4 h-4" />
//                   Date
//                 </div>

//                 {/* Day */}
//                 <p className="text-base font-semibold text-gray-900">
//                   {new Date(selectedBooking.date).toLocaleDateString("en-US", {
//                     weekday: "long",
//                   })}
//                 </p>

//                 {/* Month + Date + Year */}
//                 <p className="text-sm text-gray-700">
//                   {new Date(selectedBooking.date).toLocaleDateString("en-US", {
//                     month: "long",
//                     day: "numeric",
//                     year: "numeric",
//                   })}
//                 </p>
//               </div>

//               <div className="border rounded-xl border-gray-300 p-4">
//                 <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
//                   <Clock className="w-4 h-4" />
//                   Time
//                 </div>
//                 <p className="font-semibold text-gray-800">
//                   {selectedBooking.time}
//                 </p>
//               </div>
//             </div>

//             {/* Services */}
//             <div className="border border-gray-300 rounded-xl p-4">
//               <h3 className="font-semibold text-black mb-4">Services</h3>

//               <div className="space-y-3">
//                 {selectedBooking.serviceIds.map((s) => (
//                   <div key={s._id} className="flex justify-between text-sm">
//                     <span className="text-gray-700">{s.serviceName}</span>
//                     <span className="font-medium text-gray-800">
//                       ₹{s.displayPrice}
//                     </span>
//                   </div>
//                 ))}
//               </div>

//               <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between">
//                 <span className="font-semibold text-black">Total Amount</span>
//                 <span className="text-lg font-bold text-black">
//                   ₹{selectedBooking.price}
//                 </span>
//               </div>
//             </div>

//             {/* ACTIONS (ONLY ACTIVE) */}
//             {selectedBooking.status === "active" && (
//               <div className="mt-4 flex gap-3">
//                 {/* Cancel */}
//                 <button
//                   onClick={() => confirmCancelBooking(selectedBooking)}
//                   className="flex-1 py-3 rounded-xl border border-red-500 text-red-600 font-semibold
//                  hover:bg-red-50 active:scale-[0.98] transition"
//                 >
//                   Cancel
//                 </button>
//                 {/* Reschedule */}
//                 <button
//                   onClick={() => handleRescheduleConfirm(selectedBooking)}
//                   className="flex-1 py-3 rounded-xl border border-black text-black font-semibold
//                  hover:bg-gray-100 active:scale-[0.98] transition"
//                 >
//                   Reschedule
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>

//   );
// }

// // Optimize code

"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Image from "next/image";
import { X, Clock, Calendar, Star } from "lucide-react";
import EmptyState from "@/app/utils/nothing";
import { Modal } from "antd";
import { useRouter, usePathname } from "next/navigation";
import { collection, query, where, onSnapshot } from "firebase/firestore";

import { db } from "@/lib/firebase";

/* ─────────────────────────────────────────────
   MODULE-LEVEL HELPERS
   Created once — never recreated on re-render
───────────────────────────────────────────── */
const getDateTime = (dateStr, timeStr) => {
  const d = new Date(dateStr);
  const [time, meridian] = timeStr.split(" ");
  let [hours, minutes] = time.split(":").map(Number);
  if (meridian === "PM" && hours !== 12) hours += 12;
  if (meridian === "AM" && hours === 12) hours = 0;
  d.setHours(hours, minutes, 0, 0);
  return d;
};

const sortByDateTimeAsc = (arr) =>
  [...arr].sort(
    (a, b) => getDateTime(a.date, a.time) - getDateTime(b.date, b.time),
  );

const FALLBACK_IMAGE = "/fallback-avatar.png"; // ✅ add a fallback image to your /public folder

/* ─────────────────────────────────────────────
   SKELETON CARD — shown during loading
───────────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-4 animate-pulse">
    <div className="w-16 h-16 rounded-full bg-gray-200 shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="h-3 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-1/3 mt-3" />
      <div className="h-3 bg-gray-200 rounded w-1/4" />
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */
export default function BookingHistoryPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [userId, setUserId] = useState(null);
  const [shopId, setShopId] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState("live");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const [fetchError, setFetchError] = useState(false); // ✅ error state

  // Shop review states
  const [hasReviewed, setHasReviewed] = useState(false);
  const [reviewStatusChecked, setReviewStatusChecked] = useState(false);

  const [dismissedReview, setDismissedReview] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  /* ── 1. Read localStorage ONCE on mount ── */
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (user) {
      setUserId(user._id);
      setShopId(user.shopId);
    } else {
      router.replace("/");
    }
  }, [router]);

  useEffect(() => {
    if (!userId) return;

    const statusQuery = query(
      collection(db, "appointmentStatusUpdates"),
      where("userId", "==", userId),
    );

    const unsubscribe = onSnapshot(
      statusQuery,
      (snapshot) => {
        const statusUpdates = new Map();

        snapshot.forEach((doc) => {
          const data = doc.data();

          statusUpdates.set(data.appointmentId, data.status);
        });

        setAppointments((prevAppointments) =>
          prevAppointments.map((appointment) => {
            const latestStatus = statusUpdates.get(appointment._id.toString());

            if (!latestStatus) return appointment;

            return {
              ...appointment,
              status: latestStatus,
            };
          }),
        );
      },
      (error) => {
        // console.error("Status listener error:", error);
      },
    );

    return () => unsubscribe();
  }, [userId]);

  /* ── 2. Parallel status-update (Promise.all) ── */
  const handleAutoStatusUpdate = useCallback(async (list) => {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const updated = await Promise.all(
      list.map(async (appt) => {
        const apptDate = getDateTime(appt.date, appt.time);

        let newStatus = appt.status;
        if (apptDate < oneDayAgo) {
          if (appt.status === "active") newStatus = "cancelled";
          if (appt.status === "confirmed") newStatus = "completed";
        }

        if (newStatus === appt.status) return appt; // nothing to update

        try {
          const res = await fetch("/api/proxy", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              endpoint: "putAppointment",
              appointmentId: appt._id,
              status: newStatus,
            }),
          });

          if (!res.ok) {
            throw new Error("Appointment status update failed");
          }

          const data = await res.json();

          if (!data.success) {
            throw new Error(data.message || "Appointment status update failed");
          }

          return { ...appt, status: newStatus };
        } catch (err) {
          console.error("Status update failed:", err);
          return appt;
        }
      }),
    );

    setAppointments(updated);
    setLoading(false);
  }, []);

  /* ── 3. Fetch appointments (with AbortController cleanup) ── */
  useEffect(() => {
    if (!userId || !shopId) return;

    const controller = new AbortController();
    setFetchError(false);

    (async () => {
      try {
        const res = await fetch(
          `/api/proxy?endpoint=getAppointment&shopId=${shopId}&userId=${userId}&status=active,confirmed,completed,cancelled`,
          { signal: controller.signal },
        );
        const data = await res.json();

        if (data.success) handleAutoStatusUpdate(data.appointments);
        else setLoading(false);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Fetch failed:", err);
          setFetchError(true); // ✅ surface error to user
          setLoading(false);
        }
      }
    })();

    return () => controller.abort(); // ✅ cleanup on unmount
  }, [userId, shopId, handleAutoStatusUpdate]);

  /* ── 4. Back button override ── */
  useEffect(() => {
    const handleBack = () => router.replace("/pages/newUser");
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handleBack);
    return () => window.removeEventListener("popstate", handleBack);
  }, [router]);

  /* ── 5. Memoized filters ── */
  const { liveConfirmed, liveActive, completed, cancelled } = useMemo(
    () => ({
      liveConfirmed: appointments.filter((a) => a.status === "confirmed"),
      liveActive: appointments.filter((a) => a.status === "active"),
      completed: appointments.filter((a) => a.status === "completed"),
      cancelled: appointments.filter((a) => a.status === "cancelled"),
    }),
    [appointments],
  );

  /* ── 6. Memoized tab list ── */
  const list = useMemo(() => {
    if (activeTab === "live")
      return sortByDateTimeAsc([...liveConfirmed, ...liveActive]);
    if (activeTab === "completed") return sortByDateTimeAsc(completed);
    if (activeTab === "cancelled") return sortByDateTimeAsc(cancelled);
    return [];
  }, [activeTab, liveConfirmed, liveActive, completed, cancelled]);

  /* ── Check shop review status ── */
  /* ── Check shop review status ── */
  useEffect(() => {
    if (loading || !userId || !shopId) return;

    // Reset dismissed state whenever the route changes.
    setDismissedReview(false);

    if (completed.length === 0) {
      setReviewStatusChecked(true);
      setHasReviewed(false);
      return;
    }

    let isMounted = true;

    const checkReview = async () => {
      try {
        setReviewStatusChecked(false);

        const res = await fetch(
          `/api/proxy?endpoint=getRating&shopId=${encodeURIComponent(shopId)}&userId=${encodeURIComponent(userId)}`,
          { cache: "no-store" },
        );

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Unable to check review");
        }

        if (isMounted) {
          setHasReviewed(data.reviewed);
          setReviewStatusChecked(true);
        }
      } catch (error) {
        console.error("Review status check failed:", error);

        if (isMounted) {
          setReviewStatusChecked(false);
        }
      }
    };

    checkReview();

    return () => {
      isMounted = false;
    };
  }, [loading, userId, shopId, completed.length, pathname]);

  /* ── 7. Stable handler references ── */
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setSelectedBooking(null);
      setIsClosing(false);
    }, 300);
  }, []);

  const confirmCancelBooking = useCallback(
    (booking) => {
      Modal.confirm({
        title: "Cancel Appointment?",
        content: "Are you sure you want to cancel this appointment?",
        okText: "Yes, Cancel",
        cancelText: "No",
        centered: true,
        okButtonProps: { danger: true },
        onOk: async () => {
          try {
            const res = await fetch("/api/proxy", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                endpoint: "putAppointment",
                appointmentId: booking._id,
                status: "cancelled",
              }),
            });
            if (!res.ok) throw new Error("Cancel failed");

            setAppointments((prev) =>
              prev.map((a) =>
                a._id === booking._id ? { ...a, status: "cancelled" } : a,
              ),
            );
            handleClose();
          } catch (err) {
            console.error(err);
            Modal.error({
              title: "Failed to cancel. Please try again.",
              centered: true,
            }); // ✅ user feedback
          }
        },
      });
    },
    [handleClose],
  );

  const handleRescheduleConfirm = useCallback(
    (booking) => {
      Modal.confirm({
        title: "Reschedule Appointment?",
        content: "Do you want to reschedule this appointment?",
        okText: "Yes, Reschedule",
        cancelText: "No",
        centered: true,
        onOk: () => {
          setSelectedBooking(null);
          setIsClosing(false);
          sessionStorage.removeItem("bookingData");
          sessionStorage.removeItem("bookingSummary");
          sessionStorage.setItem(
            "rescheduleBooking",
            JSON.stringify({
              appointmentId: booking._id,
              shopId,
              groomer: booking.groomerId,
              services: booking.serviceIds,
              date: booking.date,
              time: booking.time,
            }),
          );
          router.push("/pages/timeslot"); // ✅ SPA navigation, no full reload
        },
      });
    },
    [router, shopId],
  );

  /* ── Submit shop review ── */
  const handleSubmitReview = async () => {
    if (rating < 1 || rating > 5) {
      Modal.warning({
        title: "Please select a rating",
        centered: true,
      });
      return;
    }

    try {
      setReviewSubmitting(true);

      const res = await fetch("/api/proxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpoint: "postRating",
          shopId,
          userId,
          rating,
          feedback: reviewText.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Unable to submit review");
      }

      // Notify Navbar and FeedbackPage about the new review
      window.dispatchEvent(
        new CustomEvent("shop-feedback-updated", {
          detail: { shopId },
        }),
      );

      // Review saved successfully.
      setHasReviewed(true);
      setReviewStatusChecked(true);

      setShowReviewModal(false);
      setRating(0);
      setReviewText("");

      Modal.success({
        title: "Thank you for your review!",
        content: "Your review has been submitted successfully.",
        centered: true,
      });
    } catch (error) {
      console.error("Review submission failed:", error);

      Modal.error({
        title: "Review submission failed",
        content: error.message,
        centered: true,
      });
    } finally {
      setReviewSubmitting(false);
    }
  };

  /* ── Loading skeleton ── */
  if (loading)
    return (
      <div className="min-h-screen bg-white p-4 pb-24">
        <div className="h-7 w-36 bg-gray-200 rounded animate-pulse mb-5 mt-16" />
        <div className="flex gap-3 mb-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex-1 h-9 rounded-full bg-gray-200 animate-pulse"
            />
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );

  /* ── Error state ── */
  if (fetchError)
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-gray-600 text-center">
          Something went wrong. Please try again.
        </p>
        <button
          onClick={() => {
            setFetchError(false);
            setLoading(true);
            // re-trigger fetch by bumping a key — simplest retry pattern
            setUserId((id) => id);
          }}
          className="px-6 py-2 rounded-full bg-black text-white text-sm font-semibold"
        >
          Retry
        </button>
      </div>
    );

  /* ────────────── UI ────────────── */
  return (
    <div className="min-h-screen bg-white p-4 pb-24">
      <h1 className="text-xl font-semibold mb-5 mt-16 text-black">
        My Bookings
      </h1>

      {/* SHOP REVIEW REMINDER */}
      {reviewStatusChecked &&
        completed.length > 0 &&
        !hasReviewed &&
        !dismissedReview && (
          <div className="relative mb-5 rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
            <button
              type="button"
              onClick={() => setDismissedReview(true)}
              className="absolute right-3 top-3 text-gray-500 hover:text-black"
              aria-label="Dismiss review reminder"
            >
              <X size={18} />
            </button>

            <div className="pr-6">
              <div className="flex items-center gap-2 mb-2">
                <Star size={20} className="fill-yellow-400 text-yellow-500" />

                <h3 className="font-semibold text-gray-900">
                  How was your experience?
                </h3>
              </div>

              <p className="text-sm text-gray-600 mb-3">
                You've completed an appointment with us. Share your experience
                by rating our shop.
              </p>

              <button
                type="button"
                onClick={() => setShowReviewModal(true)}
                className="rounded-full bg-black px-5 py-2 text-sm font-semibold text-white hover:bg-gray-800"
              >
                Write a Review
              </button>
            </div>
          </div>
        )}

      {/* TABS */}
      <div className="flex gap-3 mb-5">
        {["live", "completed", "cancelled"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-full text-sm font-semibold border transition ${
              activeTab === tab
                ? "bg-black text-green-500 border-black"
                : "border-gray-300 text-gray-600 bg-white"
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {list.length === 0 && <EmptyState />}

      {/* APPOINTMENT CARDS */}
      <div className="space-y-4">
        {list.map((a) => (
          <div
            key={a._id}
            onClick={() => setSelectedBooking(a)}
            className="relative bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-4 cursor-pointer hover:shadow-md hover:border-gray-300 transition"
          >
            {/* Status dot */}
            <span
              className={`absolute top-4 right-4 w-2.5 h-2.5 rounded-full ${
                a.status === "confirmed"
                  ? "bg-green-500"
                  : a.status === "active"
                    ? "bg-yellow-500"
                    : a.status === "completed"
                      ? "bg-gray-400"
                      : "bg-red-500"
              }`}
            />

            {/* Price */}
            <span className="absolute bottom-4 right-4 text-sm font-semibold text-gray-900">
              ₹{a.price}
            </span>

            {/* Groomer image */}
            <div className="w-16 h-16 shrink-0">
              <Image
                src={a.groomerId?.profileImage || FALLBACK_IMAGE} // ✅ safe fallback
                alt={a.groomerId?.name || "Groomer"}
                width={64}
                height={64}
                className="rounded-full object-cover"
              />
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">
                {a.groomerId?.name || "Unknown Groomer"}
              </p>
              <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                {a.serviceIds?.map((s) => s.serviceName).join(", ")}
              </p>
              <div className="mt-3 space-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>
                    {new Date(a.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>{a.time}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* BOTTOM SHEET */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop */}
          <div
            onClick={handleClose}
            className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
              isClosing ? "opacity-0" : "opacity-100"
            }`}
          />

          {/* Sheet */}
          <div
            className={`relative w-full bg-white rounded-t-3xl p-5 pb-8 max-h-[90vh] overflow-y-auto transform ${
              isClosing ? "animate-slideDown" : "animate-slideUp"
            }`}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full border border-gray-400 hover:bg-gray-100 transition"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>

            {/* Groomer info */}
            <div className="flex items-center gap-4 mb-6 mt-2">
              <Image
                src={selectedBooking.groomerId?.profileImage || FALLBACK_IMAGE}
                width={72}
                height={72}
                className="rounded-full border"
                alt={selectedBooking.groomerId?.name || "Groomer"}
              />
              <div>
                <p className="text-lg font-semibold text-black">
                  {selectedBooking.groomerId?.name}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedBooking.groomerId?.department}
                </p>
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="border border-gray-300 rounded-xl p-4 space-y-1">
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Calendar className="w-4 h-4" /> Date
                </div>
                <p className="text-base font-semibold text-gray-900">
                  {new Date(selectedBooking.date).toLocaleDateString("en-US", {
                    weekday: "long",
                  })}
                </p>
                <p className="text-sm text-gray-700">
                  {new Date(selectedBooking.date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="border rounded-xl border-gray-300 p-4">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <Clock className="w-4 h-4" /> Time
                </div>
                <p className="font-semibold text-gray-800">
                  {selectedBooking.time}
                </p>
              </div>
            </div>

            {/* Services */}
            <div className="border border-gray-300 rounded-xl p-4">
              <h3 className="font-semibold text-black mb-4">Services</h3>
              <div className="space-y-3">
                {selectedBooking.serviceIds?.map((s) => (
                  <div key={s._id} className="flex justify-between text-sm">
                    <span className="text-gray-700">{s.serviceName}</span>
                    <span className="font-medium text-gray-800">
                      ₹{s.displayPrice}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between">
                <span className="font-semibold text-black">Total Amount</span>
                <span className="text-lg font-bold text-black">
                  ₹{selectedBooking.price}
                </span>
              </div>
            </div>

            {/* Actions — only for active bookings */}
            {selectedBooking.status === "active" && (
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => confirmCancelBooking(selectedBooking)}
                  className="flex-1 py-3 rounded-xl border border-red-500 text-red-600 font-semibold hover:bg-red-50 active:scale-[0.98] transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRescheduleConfirm(selectedBooking)}
                  className="flex-1 py-3 rounded-xl border border-black text-black font-semibold hover:bg-gray-100 active:scale-[0.98] transition"
                >
                  Reschedule
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SHOP REVIEW MODAL */}
      <Modal
        open={showReviewModal}
        onCancel={() => {
          if (!reviewSubmitting) {
            setShowReviewModal(false);
          }
        }}
        footer={null}
        centered
        title="Rate Your Experience"
        closable={!reviewSubmitting}
        mask={{
          closable: !reviewSubmitting,
        }}
        destroyOnHidden
      >
        <div className="py-3">
          <p className="mb-5 text-center text-sm text-gray-600">
            How would you rate your overall experience with our shop?
          </p>

          {/* STAR RATING */}
          <div className="mb-4 flex justify-center gap-3">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                aria-label={`Rate ${value} out of 5`}
                disabled={reviewSubmitting}
              >
                <Star
                  size={34}
                  className={
                    value <= rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }
                />
              </button>
            ))}
          </div>

          <p className="mb-5 text-center text-sm font-medium text-gray-700">
            {rating === 0
              ? "Select your rating"
              : ["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
          </p>

          {/* OPTIONAL COMMENT */}
          <label className="mb-2 block text-sm font-medium text-gray-800">
            Share your feedback (optional)
          </label>

          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Tell us about your experience..."
            maxLength={1000}
            rows={4}
            disabled={reviewSubmitting}
            className="w-full resize-none rounded-xl border border-gray-300 p-3 text-sm text-gray-800 outline-none focus:border-black"
          />

          <p className="mt-1 text-right text-xs text-gray-400">
            {reviewText.length}/1000
          </p>

          {/* BUTTONS */}
          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={() => setShowReviewModal(false)}
              disabled={reviewSubmitting}
              className="flex-1 rounded-xl border border-gray-300 py-3 text-sm font-semibold text-gray-700 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmitReview}
              disabled={reviewSubmitting || rating === 0}
              className="flex-1 rounded-xl bg-black py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {reviewSubmitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
