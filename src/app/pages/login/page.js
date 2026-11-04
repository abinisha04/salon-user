"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { app } from "@/lib/firebase";

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

async function getCurrentDeviceFcmToken() {
  try {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      !("Notification" in window)
    ) {
      return null;
    }

    if (!VAPID_KEY) {
      console.error("Firebase VAPID key is missing.");
      return null;
    }

    let permission = Notification.permission;

    if (permission === "default") {
      permission = await Notification.requestPermission();
    }

    if (permission !== "granted") {
      return null;
    }

    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js",
    );

    await navigator.serviceWorker.ready;

    const { getMessaging, getToken } = await import("firebase/messaging");

    const messaging = getMessaging(app);

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    return token || null;
  } catch (error) {
    console.error("FCM token generation failed:", error);
    return null;
  }
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(0);

  // OTP resend countdown
  useEffect(() => {
    if (!otpSent || timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [otpSent, timer]);

  // Send OTP API
  async function handleSendOtp(e) {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/sendOtp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to send OTP.");
        return;
      }

      setOtpSent(true);
      setOtp("");
      setTimer(60);
      setMessage("OTP sent successfully. Please check your email.");
    } catch (err) {
      setError("Unable to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Verify OTP API
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    try {
      const normalizedEmail = email.trim().toLowerCase();

      const res = await fetch("/api/verifyOtp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
          otp: otp,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.message || "OTP verification failed.");
        return;
      }

      if (result.isNewUser === false && result.user) {
        localStorage.setItem("user", JSON.stringify(result.user));
        sessionStorage.removeItem("verifiedEmail");

        try {
          const fcmToken = await getCurrentDeviceFcmToken();

          if (fcmToken) {
            const updateResponse = await fetch("/api/proxy", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                endpoint: "updateFcmToken",
                fcmToken,
              }),
            });

            const updateResult = await updateResponse.json();

            if (!updateResponse.ok || !updateResult.success) {
              console.error("FCM update failed:", updateResult.message);
            } else {
              console.log("Latest device FCM token updated.");
            }
          }
        } catch (error) {
          console.error("FCM update request failed:", error);
        }

        // Keep your existing navigation
        router.push("/pages/newUser");
      } else if (result.isNewUser === true) {
        localStorage.removeItem("user");
        sessionStorage.setItem("verifiedEmail", normalizedEmail);
        router.push("/pages/signUp");
      }
    } catch (error) {
      // console.error("OTP verification error:", error);
      setError("Something went wrong. Please try again.");
    }
  };

  // Change email
  function handleChangeEmail() {
    setOtpSent(false);
    setOtp("");
    setTimer(0);
    setMessage("");
    setError("");
  }

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.06)] px-6 py-9 sm:px-9 sm:py-10">
          {/* Header */}
          <div className="text-center mb-8">
            {/* Email Icon */}
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gray-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-9 w-9 text-white"
              >
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
              </svg>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-[#29211e]">
              {otpSent ? "Verify Your Email" : "Welcome to Zenth"}
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              {otpSent
                ? "We've sent a verification code to your email address."
                : "Enter your email address to get started with your salon experience."}
            </p>
          </div>

          {/* Email Form */}
          <form onSubmit={handleSendOtp}>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={otpSent || loading}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-base text-gray-900 outline-none transition  focus:bg-white focus:ring-2 focus:ring-[#ffffff]/10 disabled:opacity-70"
            />

            {!otpSent && (
              <button
                type="submit"
                disabled={loading}
                className="mt-5 w-full rounded-xl bg-gray-700 px-4 py-3.5 font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            )}
          </form>

          {/* OTP Form - Same Page */}
          {otpSent && (
            <form onSubmit={handleVerifyOtp} className="mt-6">
              <div className="mb-5 flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700">
                  Enter 6-digit OTP
                </label>

                <button
                  type="button"
                  onClick={handleChangeEmail}
                  disabled={loading}
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  Change email
                </button>
              </div>

              <div className="flex justify-between gap-1.5 sm:gap-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    maxLength={1}
                    value={otp[index] || ""}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");

                      const newOtp = otp.split("");
                      newOtp[index] = value.slice(-1);

                      setOtp(newOtp.join("").slice(0, 6));

                      // Move to next box only when a number is entered
                      if (value && index < 5) {
                        document.getElementById(`otp-${index + 1}`)?.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace") {
                        e.preventDefault();

                        const newOtp = otp.split("");

                        if (newOtp[index]) {
                          // Remove current box value
                          newOtp[index] = "";
                          setOtp(newOtp.join(""));
                        } else if (index > 0) {
                          // Move to previous box and remove its value
                          newOtp[index - 1] = "";
                          setOtp(newOtp.join(""));
                          document.getElementById(`otp-${index - 1}`)?.focus();
                        }
                      }

                      // Allow arrow navigation
                      if (e.key === "ArrowLeft" && index > 0) {
                        document.getElementById(`otp-${index - 1}`)?.focus();
                      }

                      if (e.key === "ArrowRight" && index < 5) {
                        document.getElementById(`otp-${index + 1}`)?.focus();
                      }
                    }}
                    onPaste={(e) => {
                      e.preventDefault();

                      const pastedOtp = e.clipboardData
                        .getData("text")
                        .replace(/\D/g, "")
                        .slice(0, 6);

                      if (pastedOtp) {
                        setOtp(pastedOtp);
                        document
                          .getElementById(
                            `otp-${Math.min(pastedOtp.length, 5)}`,
                          )
                          ?.focus();
                      }
                    }}
                    className="h-11 min-w-0 flex-1 max-w-14 rounded-xl border border-gray-300 bg-gray-50 text-center text-lg font-bold text-gray-900 outline-none transition focus:bg-white focus:ring-2 focus:ring-[#ffffff]/20 sm:h-14 sm:text-xl"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="mt-5 w-full rounded-xl bg-black px-4 py-3.5 font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              {/* Resend OTP */}
              <div className="mt-5 text-center text-sm text-gray-500">
                Didn't receive the code?
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading || timer > 0}
                  className="ml-1 font-semibold text-blue-600 disabled:cursor-not-allowed disabled:text-gray-400"
                >
                  {timer > 0 ? `Resend in ${timer}s` : "Resend OTP"}
                </button>
              </div>
            </form>
          )}

          {/* Messages */}
          {message && (
            <p
              className="mt-5 rounded-xl bg-blue-50 px-4 py-3 text-center text-sm text-blue-600"
              role="status"
            >
              {message}
            </p>
          )}

          {error && (
            <p
              className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-center text-sm text-red-600"
              role="alert"
            >
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-gray-400">
          Secure email verification · Zenth Salon
        </p>
      </div>
    </main>
  );
}
