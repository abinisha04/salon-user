"use client";

import dynamic from "next/dynamic";

// ✅ Disable SSR for lottie-react
const Lottie = dynamic(
  () => import("lottie-react").then((mod) => mod.default),
  { ssr: false },
);

export default function SuccessLottie() {
  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="w-[250px] h-[250px]">
        <Lottie
          animationData={require("../../../public/done.json")}
          loop
          autoplay
        />
      </div>
    </div>
  );
}
