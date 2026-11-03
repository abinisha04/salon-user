"use client";

import { useState, useEffect } from "react";
import { X, Menu, User, Clock, Home, Star } from "lucide-react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [shopId, setShopId] = useState(null);
  const [shopRating, setShopRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  const hideNavbarMenu =
    pathname === "/pages/login" || pathname === "/pages/signup";

  useEffect(() => {
    setMounted(true);

    const fetchShopRating = async () => {
      try {
        const shopResponse = await fetch("/api/proxy?endpoint=getShop", {
          cache: "no-store",
        });

        const shopResult = await shopResponse.json();

        if (!shopResponse.ok || !shopResult.success) {
          throw new Error("Failed to fetch shop");
        }

        const shop = shopResult.shops?.find(
          (item) => item._id === "6ae7c9ff38c6f355726abd90",
        );

        if (!shop) {
          // console.error("Zenth Salon shop not found");
          return;
        }

        setShopId(shop._id);

        const feedbackResponse = await fetch(
          `/api/proxy?endpoint=getShopFeedback&shopId=${shop._id}&page=1&limit=10`,
          { cache: "no-store" },
        );

        const feedbackResult = await feedbackResponse.json();

        if (!feedbackResponse.ok || !feedbackResult.success) {
          throw new Error("Failed to fetch shop feedback");
        }

        setShopRating(feedbackResult.averageRating || 0);
        setTotalReviews(feedbackResult.totalReviews || 0);
      } catch (error) {
        // console.error("Navbar rating error:", error);
      }
    };

    // First time fetch
    fetchShopRating();

    // Listen for new feedback
    const handleFeedbackUpdate = (event) => {
      if (event.detail?.shopId === "6ae7c9ff38c6f355726abd90") {
        fetchShopRating();
      }
    };

    window.addEventListener("shop-feedback-updated", handleFeedbackUpdate);

    return () => {
      window.removeEventListener("shop-feedback-updated", handleFeedbackUpdate);
    };
  }, []);

  if (!mounted) return null; // ⬅️ prevents hydration mismatch

  const goTo = (path) => {
    setMenuOpen(false);
    router.push(path);
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
      <div className="max-w-3xl mx-auto px-4 flex justify-between items-center h-16">
        {/* Logo */}
        {/* Logo + Shop Rating */}
        <div className="flex items-center space-x-2">
          <Image
            src="/shop-logo.png"
            alt="Zenth Salon"
            width={32}
            height={32}
            className="rounded-full"
            priority
          />

          <div className="flex flex-col">
            <span className="text-xl font-bold text-black">Zenth Salon</span>

            {shopId && (
              <button
                onClick={() => router.push(`/pages/feedback?shopId=${shopId}`)}
                className="flex items-center gap-1 text-xs text-yellow-400"
              >
                <Star size={13} className="fill-yellow-400" />
                <span>{shopRating.toFixed(1)}</span>
                <span className="text-gray-600">({totalReviews} reviews)</span>
              </button>
            )}
          </div>
        </div>

        {/* Toggle */}
        {!hideNavbarMenu && (
          <button
            className="p-2 rounded-md relative w-8 h-8"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Menu
              className={`absolute top-0 left-0 w-6 h-6 text-gray-700 transition-transform duration-300 ${
                menuOpen ? "rotate-90 opacity-0" : "rotate-0 opacity-100"
              }`}
            />

            <X
              className={`absolute top-0 left-0 w-6 h-6 text-gray-700 transition-transform duration-300 ${
                menuOpen ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"
              }`}
            />
          </button>
        )}
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed top-16 right-0 w-52 bg-white shadow-lg rounded-bl-xl
  transition-all duration-300 ease-in-out
  ${
    menuOpen
      ? "translate-x-0 opacity-100 pointer-events-auto"
      : "translate-x-full opacity-0 pointer-events-none"
  }`}
      >
        <ul className="flex flex-col gap-3 p-4 text-black font-semibold">
          {/* Home */}
          <li
            onClick={() => goTo("/")}
            className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-all duration-200
        ${
          pathname === "/" || pathname === "/pages/newUser"
            ? "bg-gray-800 text-white"
            : "text-gray-800 hover:bg-gray-100"
        }`}
          >
            <Home size={20} />
            <span>Home</span>
          </li>

          {/* History */}
          <li
            onClick={() => goTo("/pages/bookingHistory")}
            className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-all duration-200
        ${
          pathname === "/pages/bookingHistory"
            ? "bg-gray-800 text-white"
            : "text-gray-800 hover:bg-gray-100"
        }`}
          >
            <Clock size={20} />
            <span>History</span>
          </li>

          {/* Profile */}
          <li
            onClick={() => goTo("/pages/profile")}
            className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-all duration-200
        ${
          pathname === "/pages/profile"
            ? "bg-gray-800 text-white"
            : "text-gray-800 hover:bg-gray-100"
        }`}
          >
            <User size={20} />
            <span>Profile</span>
          </li>
        </ul>
      </div>
    </nav>
  );
}
