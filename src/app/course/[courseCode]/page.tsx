// src/app/course/[courseCode]/page.tsx
import CourseDetailSection from "@/components/CourseDetailSection";
import type { Course } from "@/types/course";
import type { Review } from "@/types/review";

async function getCourseByCode(courseCode: string): Promise<Course | null> {
  const res = await fetch(`http://localhost:3001/course/code/${courseCode}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

async function getReviewsByCourseCode(courseCode: string): Promise<Review[]> {
  const res = await fetch(
    `http://localhost:3001/course/code/${courseCode}/reviews`,
    { cache: "no-store" }
  );
  if (!res.ok) return [];

  const reviews = (await res.json()) as Review[];
  return reviews.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseCode: string }>; // ✅ เปลี่ยนตรงนี้
}) {
  const { courseCode } = await params; // ✅ และ await ตรงนี้

  const [course, reviews] = await Promise.all([
    getCourseByCode(courseCode),
    getReviewsByCourseCode(courseCode),
  ]);

  if (!course) {
    return (
      <main className="min-h-screen pt-28 px-6">
        <div className="mx-auto max-w-4xl rounded-2xl bg-white/80 p-6 shadow">
          <h1 className="text-xl font-bold">ไม่พบรายวิชา</h1>
          <p className="text-sm text-gray-600">courseCode: {courseCode}</p>
        </div>
      </main>
    );
  }

  return <CourseDetailSection course={course} reviews={reviews} />;
}
