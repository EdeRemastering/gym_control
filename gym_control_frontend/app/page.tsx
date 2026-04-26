"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ZudelOsShell } from "@/components/zudel-os-shell";
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
  return <ZudelOsShell />;
}
