"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("user");

    if (user) {
      router.replace("/pages/newUser");
    } else {
      router.replace("/pages/login");
    }
  }, [router]);

  return null; // or loader
}
