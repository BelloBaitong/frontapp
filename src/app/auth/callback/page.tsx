// src/app/auth/callback/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setToken, consumeReturnTo } from "@/lib/auth";

export default function AuthCallbackPage() {
  const router = useRouter();
  const sp = useSearchParams();

  useEffect(() => {
    const token = sp.get("token");
    if (!token) {
      router.replace("/");
      return;
    }

    setToken(token);

    // ✅ กลับไปหน้าที่ตั้งใจไว้ก่อน login (ถ้ามี)
    const back = consumeReturnTo();
    router.replace(back || "/");
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
