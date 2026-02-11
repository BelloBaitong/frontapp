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

// ✅ เปลี่ยนไปดึงรีวิวด้วย courseId (เพื่อให้ได้ user.name)
async function getReviewsByCourseId(courseId: number): Promise<Review[]> {
  const res = await fetch(`http://localhost:3001/course/${courseId}/review`, {
    cache: "no-store",
  });
  if (!res.ok) return [];

  // response จาก backend มี user: { name, email, ... }
  const raw = (await res.json()) as Array<
    Review & { user?: { name?: string | null; email?: string | null } }
  >;

  // ✅ แปลงให้เข้ากับ Review type ที่คุณมี (userName/userEmail)
  const reviews: Review[] = raw.map((r) => ({
    ...r,
    userName: r.user?.name ?? null,
    userEmail: r.user?.email ?? null,
  }));

  return reviews.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseCode: string }>;
}) {
  const { courseCode } = await params;

  // ✅ ต้องดึง course ก่อน เพื่อเอา course.id ไปยิงรีวิว
  const course = await getCourseByCode(courseCode);

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

  const reviews = await getReviewsByCourseId(course.id);

  return <CourseDetailSection course={course} reviews={reviews} />;
}
