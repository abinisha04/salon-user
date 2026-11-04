// // Before Optimize code

// "use client";

// import { useEffect, useState, useMemo, useCallback } from "react";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import { Drawer, message } from "antd";
// import LottieLoader from "@/app/utils/loading";
// import "@ant-design/v5-patch-for-react-19";
// import { getMessaging, getToken } from "firebase/messaging";
// import { app } from "@/app/lib/firebase";

// // ✅ FIX #1: Moved outside component — only created once, not on every render
// const AVATARS = [
//   "https://firebasestorage.googleapis.com/v0/b/bucket-list-27aee.appspot.com/o/salon_profile_1.jpg?alt=media&token=2486fbc2-5409-448f-984e-2a18e32b6f7a",
//   "https://firebasestorage.googleapis.com/v0/b/bucket-list-27aee.appspot.com/o/salon_profile_2.jpg?alt=media&token=d3d6502b-354d-4b40-bfd5-c75f5811451f",
//   "https://firebasestorage.googleapis.com/v0/b/bucket-list-27aee.appspot.com/o/salon_profile_3.jpg?alt=media&token=861ec77e-d857-4087-960f-1d70fb06371f",
//   "https://firebasestorage.googleapis.com/v0/b/bucket-list-27aee.appspot.com/o/salon_profile_4.jpg?alt=media&token=f663652e-7aff-4197-ba20-c720d97f9b0e",
//   "https://firebasestorage.googleapis.com/v0/b/bucket-list-27aee.appspot.com/o/salon_profile_5.jpg?alt=media&token=39e74a26-959c-4f2e-a566-098028681d0a",
//   "https://firebasestorage.googleapis.com/v0/b/bucket-list-27aee.appspot.com/o/salon_profile_6.jpg?alt=media&token=b05f0281-a421-49e3-a3e5-55a07aeb1992",
// ];

// // ✅ FIX #2: Moved outside component — regex compiled once, not on every render
// const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// // ✅ FIX #3: Read env once at module level
// const SHOP_ID = process.env.NEXT_PUBLIC_SHOP_ID;

// export default function SignupPage() {
//   const router = useRouter();

//   const [showAvatarSheet, setShowAvatarSheet] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [form, setForm] = useState({
//     profileImage: null,
//     name: "",
//     email: "",
//     phone: "",
//     age: "",
//     gender: "",
//   });
//   const [errors, setErrors] = useState({});

//   /* 🔔 REGISTER SERVICE WORKER */
//   useEffect(() => {
//     if (!("serviceWorker" in navigator)) return;
//     navigator.serviceWorker
//       .register("/firebase-messaging-sw.js")
//       .then(() => console.log("✅ FCM SW Registered"))
//       .catch(console.error);
//   }, []);

//   /* 🔔 FOREGROUND NOTIFICATION
//    * ✅ FIX #4: Removed duplicate top-level import of getMessaging/onMessage.
//    * Dynamic import here is correct — keeps firebase/messaging out of the initial bundle.
//    */
//   useEffect(() => {
//     if (!("serviceWorker" in navigator) || !("Notification" in window)) return;

//     const initFCM = async () => {
//       try {
//         const { getMessaging, onMessage } = await import("firebase/messaging");
//         const messaging = getMessaging(app);
//         onMessage(messaging, (payload) => {
//           console.log("📩 Foreground:", payload);
//           if (Notification.permission === "granted") {
//             new Notification(payload.data?.title || "Notification", {
//               body: payload.data?.body || "",
//             });
//           }
//         });
//       } catch (err) {
//         console.error("❌ FCM init failed:", err);
//       }
//     };

//     initFCM();
//   }, []);

//   /* 🔔 GET FCM TOKEN AT SIGNUP
//    * ✅ FIX #5: Wrapped in useCallback so it's not recreated on every render
//    */
//   const getSignupFCMToken = useCallback(async () => {
//     try {
//       if (!("Notification" in window)) return null;
//       const permission = await Notification.requestPermission();
//       if (permission !== "granted") return null;

//       const messaging = getMessaging(app);
//       const token = await getToken(messaging, {
//         vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
//       });
//       return token || null;
//     } catch (err) {
//       console.error("FCM Error:", err);
//       return null;
//     }
//   }, []);

//   /* AUTO PICK RANDOM AVATAR */
//   useEffect(() => {
//     const randomAvatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
//     setForm((prev) => ({ ...prev, profileImage: randomAvatar }));
//   }, []); // ✅ Safe: AVATARS is now a stable module-level constant

//   /* FIELD-LEVEL VALIDATION
//    * ✅ FIX #6: Wrapped in useCallback — stable reference, not recreated each render
//    */
//   const validateField = useCallback((key, value) => {
//     let error = "";
//     if (key === "name" && !value.trim()) error = "Full name is required";
//     if (key === "email" && !EMAIL_REGEX.test(value)) error = "Enter a valid email address";
//     if (key === "phone" && value.length !== 10) error = "Phone number must be 10 digits";
//     if (key === "age") {
//       const age = Number(value);
//       if (!age || age < 1 || age > 99) error = "Please enter the age";
//     }
//     if (key === "gender" && !value) error = "Please select gender";
//     setErrors((prev) => ({ ...prev, [key]: error }));
//   }, []);

//   const handleChange = useCallback((key, value) => {
//     setForm((prev) => ({ ...prev, [key]: value }));
//     validateField(key, value);
//   }, [validateField]);

//   /* FINAL FORM VALIDATION */
//   const validateForm = useCallback(() => {
//     const newErrors = {};
//     if (!form.profileImage) newErrors.profileImage = "Profile image required";
//     if (!form.name.trim()) newErrors.name = "Full name is required";
//     if (!EMAIL_REGEX.test(form.email)) newErrors.email = "Valid email required";
//     if (form.phone.length !== 10) newErrors.phone = "Phone must be 10 digits";
//     const age = Number(form.age);
//     if (!age || age < 1 || age > 99) newErrors.age = "Age must be 1 to 99";
//     if (!form.gender) newErrors.gender = "Select gender";
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   }, [form]);

//   // ✅ FIX #7: useMemo so this boolean is not recomputed on every render
//   const isFormValid = useMemo(
//     () =>
//       Object.values(errors).every((e) => !e) &&
//       !!form.profileImage &&
//       !!form.name &&
//       !!form.email &&
//       !!form.phone &&
//       !!form.age &&
//       !!form.gender,
//     [errors, form]
//   );

//   /* SUBMIT SIGNUP */
//   const handleSubmit = useCallback(async () => {
//     if (!validateForm()) return;

//     try {
//       setIsSubmitting(true);
//       const fcmToken = await getSignupFCMToken();

//       const res = await fetch(`/api/proxy`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ endpoint: "postUser", ...form, shopId: SHOP_ID, fcmToken }),
//       });

//       const result = await res.json();

//       if (!result?.user) {
//         message.error(result.error || "Signup failed");
//         setIsSubmitting(false);
//         return;
//       }

//       message.success("Profile created 🎉");
//       localStorage.setItem("user", JSON.stringify(result.user));
//       router.replace("/pages/newUser");
//     } catch (err) {
//       console.error(err);
//       message.error("Something went wrong");
//       setIsSubmitting(false);
//     }
//   }, [validateForm, getSignupFCMToken, form, router]);

//   if (isSubmitting) return <LottieLoader />;

//   return (
//     <div className="min-h-screen bg-white p-5 pb-28">
//       <h1 className="text-xl font-semibold mt-14 mb-6">Complete Your Profile</h1>

//       {/* PROFILE IMAGE PICKER */}
//       <button
//         onClick={() => setShowAvatarSheet(true)}
//         className="w-full flex items-center gap-4 border border-gray-300 rounded-2xl p-4 mb-6"
//       >
//         <div className="relative w-16 h-16 rounded-full overflow-hidden">
//           {form.profileImage && (
//             <Image src={form.profileImage} alt="Profile" fill sizes="64px" className="object-cover" />
//           )}
//         </div>
//         <div className="text-left">
//           <p className="font-semibold">Profile Photo</p>
//           <p className="text-sm text-gray-400">Choose an avatar for your profile</p>
//         </div>
//       </button>

//       {/* FORM FIELDS */}
//       <div className="space-y-4">
//         <input
//           placeholder="Full Name"
//           value={form.name}
//           onChange={(e) => handleChange("name", e.target.value)}
//           className="w-full border border-gray-300 rounded-lg p-3"
//         />
//         {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}

//         <input
//           type="email"
//           placeholder="Email Address"
//           value={form.email}
//           onChange={(e) => handleChange("email", e.target.value)}
//           className="w-full border border-gray-300 rounded-lg p-3"
//         />
//         {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

//         {/* ✅ FIX #8: type="tel" instead of type="number" — better mobile UX, no scroll-to-change */}
//         <input
//           type="tel"
//           inputMode="numeric"
//           placeholder="Phone Number"
//           value={form.phone}
//           onChange={(e) => {
//             const v = e.target.value.replace(/\D/g, "");
//             if (v.length <= 10) handleChange("phone", v);
//           }}
//           className="w-full border border-gray-300 rounded-lg p-3"
//         />
//         {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}

//         {/* ✅ FIX #9: type="text" + inputMode="numeric" for age — prevents scroll spinner */}
//         <input
//           type="text"
//           inputMode="numeric"
//           placeholder="Age"
//           value={form.age}
//           onChange={(e) => {
//             const v = e.target.value.replace(/\D/g, "");
//             if (v.length <= 2) handleChange("age", v);
//           }}
//           className="w-full border border-gray-300 rounded-lg p-3"
//         />
//         {errors.age && <p className="text-red-500 text-sm">{errors.age}</p>}

//         <select
//           value={form.gender}
//           onChange={(e) => handleChange("gender", e.target.value)}
//           className="w-full border border-gray-300 rounded-lg p-3 appearance-none bg-white"
//         >
//           <option value="">Select Gender</option>
//           <option value="Male">Male</option>
//           <option value="Female">Female</option>
//           <option value="Other">Other</option>
//         </select>
//         {errors.gender && <p className="text-red-500 text-sm">{errors.gender}</p>}
//       </div>

//       {/* SUBMIT BUTTON */}
//       <div className="fixed bottom-0 left-0 w-full p-4 bg-white border-t">
//         <button
//           disabled={!isFormValid}
//           onClick={handleSubmit}
//           className={`w-full py-3 rounded-lg font-semibold ${
//             isFormValid ? "bg-black text-green-500" : "bg-gray-300 text-gray-500"
//           }`}
//         >
//           {isFormValid ? "Welcome" : "Continue"}
//         </button>
//       </div>

//       {/* AVATAR SELECTION DRAWER */}
//       <Drawer
//         open={showAvatarSheet}
//         onClose={() => setShowAvatarSheet(false)}
//         placement="bottom"
//         height={420}
//         title="Choose an Avatar"
//       >
//         <div className="grid grid-cols-4 gap-4">
//           {AVATARS.map((src) => (
//             <button
//               key={src}
//               onClick={() => {
//                 handleChange("profileImage", src);
//                 setShowAvatarSheet(false);
//               }}
//               className={`relative w-full aspect-square rounded-full overflow-hidden ${
//                 form.profileImage === src ? "ring-2 ring-green-500" : "hover:ring-2 ring-gray-300"
//               } transition`}
//             >
//               <Image src={src} alt="" fill sizes="64px" className="object-cover" />
//             </button>
//           ))}
//         </div>
//       </Drawer>
//     </div>
//   );
// }

// //  Optimize code

"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Drawer, message } from "antd";
import LottieLoader from "@/app/utils/loading";
import { app } from "@/lib/firebase";

// ── Module-level constants (created once, never on re-render) ──────────────
const AVATARS = [
  "/profile/avatar8.jpg",
  "/profile/avatar6.jpg",
  "/profile/avatar7.jpg",
  "/profile/avatar2.jpg",
  "/profile/avatar5.jpg",
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SHOP_ID = process.env.NEXT_PUBLIC_SHOP_ID;
const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

// ── Safe storage helper (crash-safe for Safari ITP / private mode) ─────────
const safeStorage = {
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
};

// ── Initial form state (stable reference, not recreated on render) ─────────
const INITIAL_FORM = {
  profileImage: null,
  name: "",
  email: "",
  phone: "",
  age: "",
  gender: "",
};

export default function SignupPage() {
  const router = useRouter();

  const [showAvatarSheet, setShowAvatarSheet] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Get verified email from login page
  useEffect(() => {
    const verifiedEmail = sessionStorage.getItem("verifiedEmail");

    if (verifiedEmail) {
      setForm((prev) => ({
        ...prev,
        email: verifiedEmail,
      }));
    } else {
      // If user directly opens signup without email verification
      router.replace("/pages/login");
    }
  }, [router]);

  // ── Register FCM service worker ──────────────────────────────────────────
  // useEffect(() => {
  //   if (!("serviceWorker" in navigator)) return;
  //   navigator.serviceWorker
  //     .register("/firebase-messaging-sw.js")
  //     .catch((err) => console.error("SW registration failed:", err));
  //   // ✅ Removed console.log in production — errors only
  // }, []);

  // ── Listen for foreground FCM notifications ──────────────────────────────
  // ✅ FIX: Fully dynamic import — firebase/messaging stays OUT of initial bundle
  // useEffect(() => {
  //   if (!("serviceWorker" in navigator) || !("Notification" in window)) return;

  //   let unsubscribe = null;

  //   const initFCM = async () => {
  //     try {
  //       const { getMessaging, onMessage } = await import("firebase/messaging");
  //       const messaging = getMessaging(app);
  //       unsubscribe = onMessage(messaging, (payload) => {
  //         if (Notification.permission === "granted") {
  //           // console.log("FCM token not generated: permission not granted");
  //           new Notification(payload.data?.title || "Notification", {
  //             body: payload.data?.body || "",
  //           });
  //         }
  //       });
  //     } catch (err) {
  //       // console.error("FCM init failed:", err);
  //     }
  //   };

  //   initFCM();

  //   // ✅ FIX: Cleanup listener on unmount to prevent memory leak
  //   return () => {
  //     if (typeof unsubscribe === "function") unsubscribe();
  //   };
  // }, []);

  // ── Get FCM token (fully dynamic — no static firebase/messaging import) ──
  // ✅ FIX: Removed static top-level `import { getMessaging, getToken }` —
  //    that was pulling the entire firebase/messaging into the initial bundle,
  //    defeating the purpose of the dynamic import in the useEffect above.
  const getSignupFCMToken = useCallback(async () => {
    try {
      if (!("Notification" in window)) return null;
      const permission = await Notification.requestPermission();
      // console.log("Notification permission:", permission);
      if (permission !== "granted") return null;

      const { getMessaging, getToken } = await import("firebase/messaging");
      const messaging = getMessaging(app);
      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      console.log("Mobile FCM token:", token);
      console.log("Customer FCM Token:", token);
      console.log("Token generated:", !!token);
      return token || null;
    } catch (err) {
      console.error("FCM token error:", err);
      return null; // ✅ Non-blocking — signup continues even if FCM fails
    }
  }, []);

  

  // ── Auto-select random avatar on mount ───────────────────────────────────
  useEffect(() => {
    const randomAvatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
    setForm((prev) => ({ ...prev, profileImage: randomAvatar }));
  }, []);

  // ── Field validation (returns error string — reusable by validateForm) ───
  // ✅ FIX: Returns the error instead of setting state directly,
  //    so validateForm can reuse it without duplicating logic
  const validateField = useCallback((key, value) => {
    if (key === "name" && !value.trim()) return "Full name is required";
    if (key === "email" && !EMAIL_REGEX.test(value))
      return "Enter a valid email address";
    if (key === "phone" && value.length !== 10)
      return "Phone number must be 10 digits";
    if (key === "age") {
      const age = Number(value);
      if (!age || age < 1 || age > 99) return "Age must be between 1 and 99";
    }
    if (key === "gender" && !value) return "Please select gender";
    return "";
  }, []);

  // ── Handle field change + inline validation ───────────────────────────────
  const handleChange = useCallback(
    (key, value) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      const error = validateField(key, value);
      setErrors((prev) => ({ ...prev, [key]: error }));
    },
    [validateField],
  );

  // ── Avatar selection ──────────────────────────────────────────────────────
  const handleAvatarSelect = useCallback(
    (src) => {
      handleChange("profileImage", src);
      setShowAvatarSheet(false);
    },
    [handleChange],
  );

  // ── Full form validation (reuses validateField — no duplicate logic) ──────
  const validateForm = useCallback(() => {
    const keys = ["name", "email", "phone", "age", "gender"];
    const newErrors = {};

    if (!form.profileImage) newErrors.profileImage = "Profile image required";

    keys.forEach((k) => {
      const err = validateField(k, form[k]);
      if (err) newErrors[k] = err;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form, validateField]);

  // ── Derived: is the form currently valid ─────────────────────────────────
  const isFormValid = useMemo(
    () =>
      Object.values(errors).every((e) => !e) &&
      !!form.profileImage &&
      !!form.name &&
      !!form.email &&
      !!form.phone &&
      !!form.age &&
      !!form.gender,
    [errors, form],
  );

  // ── Submit signup ─────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // ✅ FCM token is non-blocking — if it fails, signup still proceeds
      const fcmToken = await getSignupFCMToken();

      const res = await fetch("/api/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: "postUser",
          ...form,
          shopId: SHOP_ID,
          fcmToken,
        }),
      });

      // ✅ FIX: Guard against non-OK HTTP responses (500, 404, etc.)
      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const result = await res.json();

      // console.log("Signup status:", res.status);
      // console.log("Signup response:", result);

      // ✅ FIX: Defensive check — API may return success:false without throwing
      if (!result?.user) {
        message.error(result?.error || "Signup failed. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // ✅ FIX: Safe localStorage write (crash-safe for private/restricted browsers)
      const saved = safeStorage.set("user", result.user);
      if (!saved) {
        // Still proceed — session will work even if localStorage failed
        // console.warn("localStorage unavailable — user data not persisted");
      }

      message.success("Profile created 🎉");
      router.replace("/pages/newUser");
    } catch (err) {
      // console.error("Signup error:", err);
      message.error(
        "Something went wrong. Please check your connection and try again.",
      );
      setIsSubmitting(false);
    }
  }, [validateForm, getSignupFCMToken, form, router]);

  // ── Loading state ─────────────────────────────────────────────────────────
  if (isSubmitting) return <LottieLoader />;

  // ── UI ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white p-5 pb-28">
      <h1 className="text-xl font-semibold mt-14 mb-6">
        Complete Your Profile
      </h1>

      {/* Avatar Picker */}
      <button
        onClick={() => setShowAvatarSheet(true)}
        className="w-full flex items-center gap-4 border border-gray-300 rounded-2xl p-4 mb-1"
        aria-label="Choose profile avatar"
      >
        <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
          {form.profileImage && (
            <Image
              src={form.profileImage}
              alt="Selected profile avatar"
              fill
              sizes="64px"
              className="object-cover"
            />
          )}
        </div>
        <div className="text-left">
          <p className="font-semibold">Profile Photo</p>
          <p className="text-sm text-gray-400">
            Choose an avatar for your profile
          </p>
        </div>
      </button>
      {/* ✅ FIX: profileImage error was never shown in original */}
      {errors.profileImage && (
        <p className="text-red-500 text-sm mb-4 pl-1">{errors.profileImage}</p>
      )}

      {/* Form Fields */}
      <div className="space-y-4 mt-4">
        <div>
          <input
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3"
            autoComplete="name"
            aria-label="Full name"
            aria-invalid={!!errors.name}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <input
            type="email"
            placeholder="Email Address"
            value={form.email}
            readOnly
            className="w-full border border-gray-300 rounded-lg p-3 bg-gray-100 text-gray-600 cursor-not-allowed"
            autoComplete="email"
            aria-label="Verified email address"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        {/* ✅ type="tel" + inputMode="numeric" — no scroll-to-change, numeric keyboard on mobile */}
        <div>
          <input
            type="tel"
            inputMode="numeric"
            placeholder="Phone Number"
            value={form.phone}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "");
              if (v.length <= 10) handleChange("phone", v);
            }}
            className="w-full border border-gray-300 rounded-lg p-3"
            autoComplete="tel"
            aria-label="Phone number"
            aria-invalid={!!errors.phone}
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
          )}
        </div>

        {/* ✅ type="text" + inputMode="numeric" — prevents scroll spinner on mobile */}
        <div>
          <input
            type="text"
            inputMode="numeric"
            placeholder="Age"
            value={form.age}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "");
              if (v.length <= 2) handleChange("age", v);
            }}
            className="w-full border border-gray-300 rounded-lg p-3"
            aria-label="Age"
            aria-invalid={!!errors.age}
          />
          {errors.age && (
            <p className="text-red-500 text-sm mt-1">{errors.age}</p>
          )}
        </div>

        <div>
          <select
            value={form.gender}
            onChange={(e) => handleChange("gender", e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 appearance-none bg-white"
            aria-label="Gender"
            aria-invalid={!!errors.gender}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          {errors.gender && (
            <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-white border-t">
        <button
          disabled={!isFormValid}
          onClick={handleSubmit}
          className={`w-full py-3 rounded-lg font-semibold transition ${
            isFormValid
              ? "bg-black text-green-500 active:opacity-80"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          aria-disabled={!isFormValid}
        >
          {isFormValid ? "Welcome" : " Continue"}
        </button>
      </div>

      {/* Avatar Drawer */}
      {isMounted && (
        <Drawer
          open={showAvatarSheet}
          onClose={() => setShowAvatarSheet(false)}
          placement="bottom"
          size={420}
          title="Choose an Avatar"
        >
          <div className="grid grid-cols-4 gap-4">
            {AVATARS.map((src) => (
              <button
                key={src}
                onClick={() => handleAvatarSelect(src)}
                aria-label="Select this avatar"
                aria-pressed={form.profileImage === src}
                className={`relative w-full aspect-square rounded-full overflow-hidden transition ${
                  form.profileImage === src
                    ? "ring-2 ring-green-500"
                    : "hover:ring-2 ring-gray-300"
                }`}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </Drawer>
      )}
    </div>
  );
}
