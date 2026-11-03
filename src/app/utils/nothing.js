"use client";

import dynamic from "next/dynamic";

const Lottie = dynamic(() => import("lottie-react"), {
  ssr: false,
});

import animationData from "../../../public/nothing.json";

export default function EmptyState({
  message = "No appointments found",
}) {
  return (
    <div className="flex flex-col items-center justify-center mt-20">
      <div className="w-[250px] h-[250px]">
        <Lottie
          animationData={animationData}
          loop
          autoplay
        />
      </div>

      <p className="text-gray-400 text-md mt-4 text-center">
        {message}
      </p>
    </div>
  );
}
