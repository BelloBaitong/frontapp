interface ReviewCardProps {
  courseCode: string;
  courseName: string;
  userName: string;
  comment: string;
  rating: number; // 1–5
}

export default function ReviewCard({
  courseCode,
  courseName,
  userName,
  comment,
  rating,
}: ReviewCardProps) {
  return (
    <div className="flex flex-col rounded-[24px] bg-white/95 shadow-md px-4 py-3 min-h-[180px]">
      <p className="text-[#7CB3FF] font-extrabold text-lg leading-tight">
        {courseCode}
      </p>
      <p className="text-black font-semibold text-sm leading-tight">
        {courseName}
      </p>

      <p className="mt-1 text-xs text-[#999]">
        ชื่อ
      </p>
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
