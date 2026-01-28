import Image from "next/image";
import Link from "next/link";

export interface CourseCardProps {
  code: string;
  titleEn: string;
  titleTh: string;
  rating: number;
  imageSrc?: string;
}

export default function CourseCard({
  code,
  titleEn,
  titleTh,
  rating,
  imageSrc,
}: CourseCardProps) {
  return (
    <Link href={`/course/${code}`} className="block">
    <div className="flex flex-col rounded-[24px] bg-white/95 shadow-md overflow-hidden min-h-[230px]">
      {/* รูปด้านบน */}
  <div className="relative w-full h-32">
    {imageSrc?.trim() ? (
      <Image
        src={imageSrc}
        alt={titleEn}
        fill
        className="object-cover"
      />
    ) : (
      <div className="w-full h-full flex items-center justify-center bg-black/5">
        <p className="px-4 text-center text-black font-semibold text-sm uppercase line-clamp-2">
          {titleEn}
        </p>
      </div>
    )}
  </div>

      {/* เนื้อหา */}
      <div className="flex flex-col gap-1 px-4 py-3">
        <p className="text-[#4A9FD8] font-bold text-lg leading-tight">
          {code}
        </p>
        <p className="text-black font-semibold text-sm leading-tight uppercase">
          {titleEn}
        </p>
        <p className="text-[#9B9B9B] text-xs">
          {titleTh}
        </p>

        <div className="mt-2 flex items-center justify-end gap-1 text-xs text-[#FFB800] font-semibold">
          <span>★</span>
          <span>{rating.toFixed(1)}</span>
        </div>
      </div>
    </div>
    </Link>
  );
}
