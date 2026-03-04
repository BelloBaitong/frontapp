"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setToken, consumeReturnTo } from "@/lib/auth";
import { userProfileGetMe } from "@/lib/api"; // ✅ เพิ่ม

export default function AuthCallbackPage() {
  const router = useRouter();
  const sp = useSearchParams();

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const token = sp.get("token");
      if (!token) {
        router.replace("/");
        return;
      }

      setToken(token);

      // ✅ เช็ค profile ใน DB ก่อน
      try {
        const p = await userProfileGetMe();

        const ok =
          !!p?.studyYear &&
          Array.isArray(p?.interests) &&
          p!.interests.length >= 3 &&
          Array.isArray(p?.careerGoals) &&
          p!.careerGoals.length >= 1;

        if (cancelled) return;

        if (!ok) {
          router.replace("/onboarding");
          return;
        }

        // ✅ กลับไปหน้าที่ตั้งใจไว้ก่อน login (ถ้ามี)
        const back = consumeReturnTo();
        router.replace(back || "/");
      } catch {
        if (cancelled) return;
        // ถ้าเรียก API ไม่ได้/มีปัญหา ให้ไปหน้า onboarding ไว้ก่อน (กันหลุด flow)
        router.replace("/onboarding");
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [router, sp]);

  return (
    <main className="min-h-screen pt-28 px-6">
      <div className="mx-auto max-w-md rounded-2xl bg-white/80 p-6 shadow">
        <p className="font-semibold">กำลังเข้าสู่ระบบ...</p>
        <p className="text-sm text-gray-600">กรุณารอสักครู่</p>
      </div>
    </main>
  );
}