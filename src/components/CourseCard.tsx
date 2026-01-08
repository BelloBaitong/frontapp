import Image from "next/image";

export interface CourseCardProps {
  code: string;
  titleEn: string;
  titleTh: string;
  rating: number;
  imageSrc: string;
}

export default function CourseCard({
  code,
  titleEn,
  titleTh,
  rating,
  imageSrc,
}: CourseCardProps) {
  return (
    <div className="flex flex-col rounded-[24px] bg-white/95 shadow-md overflow-hidden min-h-[230px]">
      {/* รูปด้านบน */}
      <div className="relative w-full h-32">
        <Image
          src={imageSrc}
          alt={titleEn}
          fill
          className="object-cover"
        />
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
  );
}
