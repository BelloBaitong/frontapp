"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  isProfileCompleted,
  syncProfileFromApi,
} from "@/lib/profile/profile.storage";
import { getToken } from "@/lib/auth";

export default function ProfileGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!pathname) return;
      if (pathname === "/onboarding") return;
      if (pathname.startsWith("/auth/callback")) return;

      const protectedPaths = ["/", "/course", "/chat"];
      const isProtected = protectedPaths.some((p) =>
        p === "/" ? pathname === "/" : pathname.startsWith(p)
      );

      if (!isProtected) return;

      // ยังไม่ login ไม่ต้องบังคับไป onboarding
      const token = getToken();
      if (!token) return;

      // ถ้า profile ครบแล้ว ปล่อยผ่าน
      if (isProfileCompleted()) return;

      // ถ้ายังไม่ครบ ลอง sync จาก backend ก่อน
      const ok = await syncProfileFromApi();
      if (cancelled) return;

      if (!ok) {
        router.replace("/onboarding");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  return <>{children}</>;
}