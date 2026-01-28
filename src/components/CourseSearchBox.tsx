"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Course } from "@/types/course";

type Props = {
  placeholder?: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default function CourseSearchBox({ placeholder = "วิชา..." }: Props) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Course[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    const keyword = q.trim();

    if (timer.current) window.clearTimeout(timer.current);

    // ถ้าว่าง -> ปิด dropdown
    if (!keyword) {
      setItems([]);
      setOpen(false);
      return;
    }

    timer.current = window.setTimeout(async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${API_BASE}/course/search?q=${encodeURIComponent(keyword)}&limit=8`,
          { cache: "no-store" }
        );

        if (!res.ok) {
          setItems([]);
          setOpen(true);
          return;
        }

        const data = (await res.json()) as Course[];
        setItems(data);
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [q]);

  function onPick(courseCode: string) {
    setOpen(false);
    router.push(`/course/${courseCode}`);
  }

  return (
    <div className="relative w-full">
      {/* input */}
      <div className="w-full bg-white/95 rounded-full shadow-lg flex items-center gap-4 px-6 py-3">
        <span className="text-2xl text-[#B58AE6]">🔍</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none text-[#777] placeholder:text-[#D1D1D1] text-base"
          onFocus={() => {
            if (items.length > 0) setOpen(true);
          }}
        />
      </div>

      {/* dropdown */}
      {open && (
        <div className="absolute left-0 right-0 mt-3 z-50">
          <div className="rounded-2xl bg-white/95 shadow-xl border border-black/5 overflow-hidden">
            {loading && (
              <div className="px-4 py-3 text-sm text-gray-500">กำลังค้นหา...</div>
            )}

            {!loading && items.length === 0 && (
              <div className="px-4 py-3 text-sm text-gray-500">
                ไม่พบผลลัพธ์
              </div>
            )}

            {!loading && items.length > 0 && (
              <ul className="max-h-80 overflow-auto">
                {items.map((c) => (
                  <li key={c.courseCode}>
                    <button
                      type="button"
                      className="w-full text-left px-4 py-3 hover:bg-black/5 transition"
                      onMouseDown={(e) => e.preventDefault()} // กัน blur ก่อน click
                      onClick={() => onPick(c.courseCode)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-semibold text-[#4A9FD8]">
                            {c.courseCode}
                          </p>
                          <p className="font-bold uppercase truncate">
                            {c.courseNameEn ?? c.courseName ?? "-"}
                          </p>
                          <p className="text-xs text-gray-600 truncate">
                            {c.courseNameTh ?? "-"}
                          </p>
                        </div>

                        <span className="text-xs rounded-full bg-black/5 px-2 py-1 shrink-0">
                          {c.category ?? "-"}
                        </span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* click outside helper */}
          <div
            className="fixed inset-0 z-[-1]"
            onMouseDown={() => setOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
