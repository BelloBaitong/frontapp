"use client";

import { useMemo, useState } from "react";
import type { Course } from "@/types/course";
import CourseCard from "@/components/CourseCard";

type SortKey = "popular" | "az" | "za";

export default function CoursesSection({ courses }: { courses: Course[] }) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("popular");

  // แปลงข้อมูลจาก backend -> props ของ CourseCard (เหมือนใน HomeSection)
  const mapped = useMemo(() => {
      const normalized = courses.map((c) => ({
        
        code: c.courseCode,
        titleEn: c.courseNameEn ?? c.courseName ?? "-",
        titleTh: c.courseNameTh ?? c.description ?? "-",
        rating: Number(c.avgRating ?? 0),
        reviewCount: Number(c.reviewCount ?? 0),
        imageSrc: c.imageUrl ?? "",
        createdAt: c.createdAt ? new Date(c.createdAt) : null,
      }));

    // search
    const filtered = normalized.filter((x) => {
      const hay = `${x.code} ${x.titleEn} ${x.titleTh}`.toLowerCase();
      return hay.includes(q.trim().toLowerCase());
    });

const sorted = [...filtered].sort((a, b) => {
  if (sort === "az") return a.titleEn.localeCompare(b.titleEn);

  if (sort === "za") return b.titleEn.localeCompare(a.titleEn);

  if (sort === "popular") {
    const reviewA = a.reviewCount ?? 0;
    const reviewB = b.reviewCount ?? 0;

    const ratingA = a.rating ?? 0;
    const ratingB = b.rating ?? 0;

    // 1. เรียงตามจำนวนรีวิวก่อน (มาก → น้อย)
    if (reviewB !== reviewA) {
      return reviewB - reviewA;
    }

    // 2. ถ้ารีวิวเท่ากัน → เรียงตาม rating (มาก → น้อย)
    return ratingB - ratingA;
  }

  return 0;
});

    return sorted;
  }, [courses, q, sort]);

  return (
        <main className="w-full min-h-screen pt-28 pb-16 px-4 sm:px-8">
        <section className="max-w-6xl mx-auto flex flex-col gap-10">
        {/* Top bar: title + filter */}
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-extrabold text-white drop-shadow-sm">
            รายวิชาทั้งหมด
          </h1>

          {/* Dropdown filter (มุมขวา) */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="appearance-none bg-white/90 rounded-2xl shadow-md px-4 py-2 pr-10 text-sm font-semibold text-[#6B6B6B] outline-none"
            >
              <option value="popular">ยอดนิยม</option>
              <option value="az">A–Z</option>
              <option value="za">Z–A</option>
            </select>            
          </div>
        </div>

        {/* Search */}
        <div className="w-full">
          <div className="w-full bg-white/95 rounded-full shadow-lg flex items-center gap-4 px-6 py-3">
            <span className="text-2xl text-[#B58AE6]">🔍</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              type="text"
              placeholder="ค้นหารหัสวิชา / ชื่อวิชา..."
              className="flex-1 bg-transparent outline-none text-[#777] placeholder:text-[#D1D1D1] text-base"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {mapped.map((course) => (
            <CourseCard key={course.code} {...course} />
          ))}
        </div>

        {/* Empty state */}
        {mapped.length === 0 && (
          <div className="text-center text-white/90 drop-shadow-sm py-10">
            ไม่พบรายวิชาที่ตรงกับคำค้นหา
          </div>
        )}
      </section>
    </main>
  );
}
