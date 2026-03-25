"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ProfileOnboardingForm from "@/components/ProfileOnboardingForm";
import type { UserProfile } from "@/types/userProfile";
import { userProfileUpsertMe } from "@/lib/api";

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (profile: UserProfile) => {
    setLoading(true);
    try {
      await userProfileUpsertMe({
        studyYear: Number(profile.year),
        interests: profile.interests,
        careerGoals: profile.careerGoals,
        completedCourseIds: profile.completedCourseIds ?? [],
      });

      router.replace("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-width padding-x pt-28 pb-10">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-200/60 via-pink-200/40 to-emerald-200/50" />
      <div className="relative mx-auto max-w-4xl px-4 py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-white drop-shadow md:text-4xl">
            ตั้งค่าโปรไฟล์เพื่อแนะนำรายวิชา
          </h1>
          <p className="mt-2 text-white/90">
            เลือกความสนใจ อาชีพที่สนใจ และวิชาที่เคยเรียนแล้ว
            เพื่อให้ระบบแนะนำได้แม่นยำขึ้น
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