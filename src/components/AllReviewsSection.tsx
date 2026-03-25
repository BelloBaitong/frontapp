"use client";

import { useMemo, useState } from "react";
import type { Review } from "@/types/review";
import ReviewCard from "@/components/ReviewCard";

function normalizeText(value: unknown) {
  return String(value ?? "").toLowerCase().trim();
}

export default function AllReviewsSection({
  reviews,
}: {
  reviews: Review[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [minRating, setMinRating] = useState("all");

  const filteredReviews = useMemo(() => {
    const keyword = normalizeText(searchTerm);

    return (reviews ?? []).filter((r: any) => {
      const courseCode = normalizeText(r.course?.courseCode);
      const courseName = normalizeText(
        r.course?.courseNameEn ?? r.course?.courseNameTh
      );
      const comment = normalizeText(r.comment);
      const userName = normalizeText(r.userName ?? r.user?.name ?? r.userEmail);
      const rating = Number(r.rating ?? 0) || 0;

      const matchedKeyword =
        !keyword ||
        courseCode.includes(keyword) ||
        courseName.includes(keyword) ||
        comment.includes(keyword) ||
        userName.includes(keyword);

      const matchedRating =
        minRating === "all" ? true : rating >= Number(minRating);

      return matchedKeyword && matchedRating;
    });
  }, [reviews, searchTerm, minRating]);

  const reviewCards = filteredReviews.map((r: any) => ({
    reviewId: r.id,
    courseCode: r.course?.courseCode ?? "-",
    courseName: r.course?.courseNameEn ?? r.course?.courseNameTh ?? "-",
    userName: r.isAnonymous ? "ไม่ระบุชื่อ" : r.userName ?? r.userEmail ?? r.user?.name ?? "ผู้ใช้",
    comment: r.comment ?? "",
    rating: Number(r.rating ?? 0) || 0,
  }));

  return (
    <main className="w-full min-h-screen pt-28 pb-16 px-4 sm:px-8">
      <section className="max-w-6xl mx-auto flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white drop-shadow-md">
            รีวิวทั้งหมด
          </h1>
          <p className="text-white/90">
            ค้นหารีวิวรายวิชาและกรองตามระดับคะแนนได้
          </p>
        </div>

        <div className="rounded-3xl bg-white/80 backdrop-blur-md shadow-lg border border-white/40 p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ค้นหารีวิว
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหาจากรหัสวิชา ชื่อวิชา ชื่อผู้ใช้ หรือข้อความรีวิว"
                className="w-full rounded-2xl border border-black/10 bg-white/90 px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                กรองคะแนนรีวิว
              </label>
              <select
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                className="w-full rounded-2xl border border-black/10 bg-white/90 px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
              >
                <option value="all">ทั้งหมด</option>
                <option value="5">5 ดาว</option>
                <option value="4">4 ดาวขึ้นไป</option>
                <option value="3">3 ดาวขึ้นไป</option>
                <option value="2">2 ดาวขึ้นไป</option>
                <option value="1">1 ดาวขึ้นไป</option>
              </select>
            </div>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            พบ {reviewCards.length} รีวิว
          </p>
        </div>

        {reviewCards.length === 0 ? (
          <div className="rounded-3xl bg-white/80 backdrop-blur-md shadow-lg border border-white/40 p-6 text-gray-700">
            ไม่พบรีวิวที่ตรงกับเงื่อนไข
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {reviewCards.map((review, index) => (
              <ReviewCard
                key={`${review.courseCode}-${review.reviewId ?? index}-${index}`}
                {...review}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}