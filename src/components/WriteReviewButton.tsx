"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { getToken, setReturnTo } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

type WriteReviewButtonProps = {
  courseCode: string;
  hasReviewed?: boolean;
  reviewId?: number;
};

export default function WriteReviewButton({
  courseCode,
  hasReviewed = false,
  reviewId,
}: WriteReviewButtonProps) {
  const router = useRouter();
  const token = useMemo(() => getToken(), []);

  function onClick() {
    const path =
      hasReviewed && reviewId
        ? `/course/${courseCode}/review?mode=edit&reviewId=${reviewId}`
        : `/course/${courseCode}/review`;

    if (!token) {
      setReturnTo(path);
      window.location.href = `${API_BASE}/auth/google`;
      return;
    }

    router.push(path);
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl px-4 py-2 font-bold bg-white/80 hover:bg-white shadow border border-black/5"
    >
      {hasReviewed ? "แก้ไขรีวิวของฉัน" : "เขียนรีวิว"}
    </button>
  );
}