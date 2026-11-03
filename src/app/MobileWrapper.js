"use client";

import { useEffect, useState } from "react";

export default function MobileWrapper({ children }) {
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  if (!isMobile) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center text-center p-6 bg-gray-100">
        <h1 className="text-2xl font-semibold text-gray-800">
          Please use a mobile device
        </h1>

        <p className="text-gray-600 mt-2">
          This application is optimized for mobile screens.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}