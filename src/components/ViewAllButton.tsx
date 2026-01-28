import Link from "next/link";

type ViewAllButtonProps = {
  href: string;
  label?: string;
};

export default function ViewAllButton({
  href,
  label = "ดูทั้งหมด",
}: ViewAllButtonProps) {
  return (
    <Link
      href={href}
      className="
        inline-flex items-center gap-2
        px-6 py-2
        rounded-full
        bg-white/100 backdrop-blur-md
        ring-1 ring-white/100
        text-white font-semibold
        shadow-md hover:shadow-lg
        transition
      "
    >
      {label}
      <span className="text-lg leading-none">›</span>
    </Link>
  );
}
