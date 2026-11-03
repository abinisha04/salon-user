"use client";
// 👆 Marks this file as a Client Component so hooks, localStorage,
// and router can be used safely in the browser

import { useEffect, useState } from "react";
// 👆 React hooks for state and lifecycle handling

import Image from "next/image";
// 👆 Next.js optimized image component

import { useRouter } from "next/navigation";
// 👆 Next.js router for navigation and redirects

import {
  ChevronRight,
  LogOut,
  HelpCircle,
  FileText,
  User,
  MessageSquareText,
} from "lucide-react";
// 👆 Icons used in profile menu options

export default function ProfilePage() {
  // ---------------- ROUTER ----------------
  const router = useRouter();
  // 👆 Used for page navigation and redirects

  // ---------------- STATE ----------------
  const [user, setUser] = useState(null);
  // 👆 Stores logged-in user details

  /* ---------------- LOAD USER FROM LOCAL STORAGE ---------------- */
  useEffect(() => {
    // Get user data from localStorage (client-side only)
    const stored =
      typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("user"))
        : null;

    // If no user found, redirect to home (safety fallback)
    if (!stored) {
      router.replace("/");
      return;
    }

    // Save user to state
    setUser(stored);
  }, [router]);

  // Prevent rendering until user data is loaded
  if (!user) return null;

  /* ---------------- ACTION HANDLERS ---------------- */

  // Generic navigation helper
  const goTo = (path) => router.push(path);

  // Logout handler
  const handleLogout = () => {
    // Remove user data
    localStorage.removeItem("user");

    // Clear any temporary session data
    sessionStorage.clear();

    // Redirect to home / login page
    router.replace("/");
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-white pb-24">
      {/* ---------------- HEADER / PROFILE INFO ---------------- */}
      <div className="px-5 pt-20 pb-6">
        <div className="flex flex-col items-center">
          {/* Profile Image */}
          <div className="relative w-24 h-24 rounded-full overflow-hidden border border-gray-200">
            <Image
              src={user.profileImage || "/avatar-placeholder.png"}
              alt="Profile"
              fill
              className="object-cover"
            />
          </div>

          {/* User Name */}
          <h2 className="mt-4 text-lg font-semibold text-black">{user.name}</h2>

          {/* User Phone */}
          <p className="text-sm text-gray-500 mt-1">{user.phone}</p>
        </div>
      </div>

      {/* ---------------- MENU OPTIONS ---------------- */}
      <div className="px-4 mt-6 space-y-4">
        {/* ACCOUNT SECTION */}
        <div className="bg-white rounded-xl border border-gray-300">
          <MenuItem
            icon={<User />}
            label="Edit Profile"
            onClick={() => goTo("/pages/editProfile")}
          />
        </div>

        {/* SUPPORT SECTION */}
        <div className="bg-white rounded-xl border border-gray-300">
          <MenuItem
            icon={<FileText />}
            label="FAQ"
            onClick={() => goTo("/pages/faq")}
          />
          <Divider />

          <MenuItem
            icon={<MessageSquareText />}
            label="Feedback"
            onClick={() => goTo("/pages/myFeedback")}
          />
          <Divider />

          <Divider />
          <MenuItem
            icon={<HelpCircle />}
            label="Support & Help"
            onClick={() => goTo("/pages/support")}
          />
        </div>

        {/* LOGOUT SECTION */}
        <div className="bg-white rounded-xl border border-red-300">
          <MenuItem
            icon={<LogOut className="text-red-500" />}
            label="Sign Out"
            danger
            onClick={handleLogout}
          />
        </div>
      </div>
    </div>
  );
}

/* ---------------- REUSABLE MENU ITEM ---------------- */
// Single row used in profile menu list
function MenuItem({ icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-4 text-left
        ${danger ? "text-red-600" : "text-gray-600"}
        hover:bg-gray-50 transition`}
    >
      {/* Left side: icon + label */}
      <div className="flex items-center gap-3">
        <span className="w-9 h-9 rounded-full flex items-center justify-center">
          {icon}
        </span>
        <span className="font-medium">{label}</span>
      </div>

      {/* Right arrow */}
      <ChevronRight className="w-5 h-5 text-gray-400" />
    </button>
  );
}

/* ---------------- DIVIDER ---------------- */
// Thin horizontal divider between menu items
function Divider() {
  return <div className="h-px bg-gray-200 mx-4" />;
}
