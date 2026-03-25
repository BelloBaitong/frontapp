import AllReviewsSection from "@/components/AllReviewsSection";
import type { Review } from "@/types/review";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3001";

async function getAllReviews(): Promise<Review[]> {
  try {
    const res = await fetch(`${API_BASE}/review`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export default async function ReviewsPage() {
  const reviews = await getAllReviews();

  return <AllReviewsSection reviews={reviews} />;
}