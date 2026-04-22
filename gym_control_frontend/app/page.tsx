"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { GymControlShell } from "@/components/gym-os-shell";
import { useSessionStore } from "@/lib/session-store";

export default function Home() {
  const router = useRouter();
  const token = useSessionStore((state) => state.accessToken);

  useEffect(() => {
    if (!token) {
      router.replace("/login");
    }
  }, [router, token]);

  if (!token) return null;
  return <GymControlShell />;
}
