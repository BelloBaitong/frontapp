"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isProfileCompleted, syncProfileFromApi } from "@/lib/profile/profile.storage";

export default function ProfileGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // ✅ ไม่บังคับในหน้าที่ไม่ควรถูกเด้ง
      if (!pathname) return;
      if (pathname === "/onboarding") return;
      if (pathname.startsWith("/auth/callback")) return;

      // ✅ บังคับก่อนเข้า "หน้าหลัก" และหน้าที่ต้องใช้โปรไฟล์
      // - "/" = HomeSection
      // - "/course" "/chat" = หน้าฟีเจอร์หลัก
      const protectedPaths = ["/", "/course", "/chat"];
      const isProtected = protectedPaths.some((p) =>
        p === "/" ? pathname === "/" : pathname.startsWith(p)
      );
      if (!isProtected) return;

      // 1) ถ้า local ครบแล้ว ผ่านเลย
      if (isProfileCompleted()) return;

      // 2) local ไม่ครบ -> ลอง sync จาก backend ก่อน
      const ok = await syncProfileFromApi();
      if (cancelled) return;

      // 3) ถ้ายังไม่ครบ ค่อยเด้งไป onboarding
      if (!ok) router.replace("/onboarding");
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  return <>{children}</>;
}