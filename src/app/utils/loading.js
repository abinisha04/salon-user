'use client'

import dynamic from 'next/dynamic';

// ✅ Disable SSR for lottie-react
const Lottie = dynamic(
  () => import("lottie-react").then((mod) => mod.default),
  { ssr: false }
);

export default function LottieLoader() {
  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="w-24 h-24">
        <Lottie
          animationData={require('../../../public/loading.json')}
          loop
          autoplay
        />
      </div>
    </div>
  )
}
