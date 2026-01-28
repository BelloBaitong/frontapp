import type { Course } from "@/types/course";
import { CoursesSection } from "@/components";

async function getCourses(): Promise<Course[]> {
  const res = await fetch("http://localhost:3001/course", { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <main className="overflow-hidden">
      <CoursesSection courses={courses} />
    </main>
  );
}
