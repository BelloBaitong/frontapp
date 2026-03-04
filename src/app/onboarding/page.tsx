"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ProfileOnboardingForm from "@/components/ProfileOnboardingForm";
import type { UserProfile } from "@/types/userProfile";
import { saveProfileToStorage } from "@/lib/profile/profile.storage";
import { userProfileUpsertMe } from "@/lib/api"; // ✅ เพิ่ม

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (profile: UserProfile) => {
    setLoading(true);
    try {
      // ✅ 1) save ลง DB ก่อน
      await userProfileUpsertMe({
        studyYear: Number(profile.year),
        interests: profile.interests,
        careerGoals: profile.careerGoals,
      });
      // ✅ 2) หลัง onboarding ให้เข้าหน้า HomeSection ("/")
      router.replace("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-width padding-x pt-28 pb-10">
      {/* background layer ไม่กินคลิก */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-200/60 via-pink-200/40 to-emerald-200/50" />
      <div className="relative mx-auto max-w-4xl px-4 py-10">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow">
            ตั้งค่าโปรไฟล์เพื่อแนะนำรายวิชา
          </h1>
          <p className="mt-2 text-white/90">
            เลือกข้อมูลหลัก ๆ เพื่อให้ระบบจัดลำดับวิชาได้ตรงกับคุณ
          </p>
        </div>

        <ProfileOnboardingForm onSubmit={handleSubmit} loading={loading} />

        <p className="mt-6 text-xs text-white/80">
          * คุณสามารถแก้ไขโปรไฟล์นี้ภายหลังได้
        </p>
      </div>
    </main>
  );
}