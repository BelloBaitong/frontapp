import HomeSection from "@/components/HomeSection";
import type { Course } from "@/types/course";
import type { Review } from "@/types/review";

async function getCourses(): Promise<Course[]> {
  const res = await fetch("http://localhost:3001/course", {
    cache: "no-store",
  });

  if (!res.ok) return [];
  return res.json();
}

async function getLatestReviews(): Promise<Review[]> {
  const res = await fetch("http://localhost:3001/review", { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

async function getPopularCourses() {
  const res = await fetch(
    "http://localhost:3001/course/popular?limit=8&sort=weighted",
    { cache: "no-store" }
  );
  if (!res.ok) return [];
  return res.json();
}

export default async function Home() {
  const courses = await getCourses();
  const reviews = await getLatestReviews();
  const popularCourses = await getPopularCourses();
  
  return (
    <main className="overflow-hidden">
      <HomeSection courses={courses} reviews={reviews} popularCourses={popularCourses} />
    </main>
  );
}
