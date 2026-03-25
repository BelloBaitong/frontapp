"use client";

import { useRouter } from "next/navigation";

interface ReviewCardProps {
  reviewId?: number;
  courseCode: string;
  courseName: string;
  userName: string;
  comment: string;
  rating: number;
  isOwner?: boolean;
}

export default function ReviewCard({
  reviewId,
  courseCode,
  courseName,
  userName,
  comment,
  rating,
  isOwner = false,
}: ReviewCardProps) {
  const router = useRouter();

  const handleEdit = () => {
    if (!reviewId) return;
    router.push(`/course/${courseCode}/review?mode=edit&reviewId=${reviewId}`);
  };

  return (
    <div className="flex flex-col rounded-[24px] bg-white/95 shadow-md px-4 py-3 min-h-[180px]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[#7CB3FF] font-extrabold text-lg leading-tight">
            {courseCode}
          </p>
          <p className="text-black font-semibold text-sm leading-tight">
            {courseName}
          </p>
        </div>

        {isOwner && reviewId && (
          <button
            type="button"
            onClick={handleEdit}
            className="shrink-0 rounded-xl px-3 py-1.5 text-sm font-semibold bg-[#EEF5FF] text-[#2563EB] hover:bg-[#DCEBFF] transition"
          >
            แก้ไขรีวิว
          </button>
        )}
      </div>

      <p className="mt-1 text-xs text-[#999]">ชื่อ</p>
      <p className="text-sm font-semibold">{userName}</p>

      <p className="mt-2 text-xs text-[#777] line-clamp-3">
        {comment}
      </p>

      <div className="mt-3 flex items-center gap-1 text-sm">
        {Array.from({ length: 5 }).map((_, index) => (
          <span
            key={index}
            className={index < rating ? "text-[#FFB800]" : "text-[#E0E0E0]"}
          >
            ★
          </span>
        ))}
      </div>
    </div>
  );
}