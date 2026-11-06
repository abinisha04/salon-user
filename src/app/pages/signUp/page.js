
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

      const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js",
      );

      await navigator.serviceWorker.ready;

      const { getMessaging, getToken } = await import("firebase/messaging");
      const messaging = getMessaging(app);
      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      // console.log("Mobile FCM token:", token);
      // console.log("Customer FCM Token:", token);
      // console.log("Token generated:", !!token);
      return token || null;
    } catch (err) {
      // console.error("FCM token error:", err);
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

