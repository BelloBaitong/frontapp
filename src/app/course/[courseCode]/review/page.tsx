"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getToken, setReturnTo } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default function NewReviewPage() {
  const router = useRouter();
  const params = useParams<{ courseCode: string }>();
  const courseCode = params.courseCode;

  const token = useMemo(() => getToken(), []);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // ✅ กันคนไม่ login
  useEffect(() => {
    if (!token) {
      setReturnTo(`/course/${courseCode}/review/new`);
      window.location.href = `${API_BASE}/auth/google`;
    }
  }, [token, courseCode]);

 async function fetchCourseIdByCode(code: string, token: string) {
  const res = await fetch(`${API_BASE}/course/code/${code}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Cannot find course by code (${code})`);
  }

  const course = await res.json();
  return course.id as number;
}

async function submit() {
  setErr("");

  const token = getToken();
  if (!token) {
    setErr("กรุณาเข้าสู่ระบบก่อน");
    return;
  }

  try {
    // 1) แปลง courseCode -> courseId ก่อน
    const courseId = await fetchCourseIdByCode(courseCode, token);

    // 2) ส่งรีวิวไป endpoint ที่ backend มีอยู่จริง
    const res = await fetch(`${API_BASE}/course/${courseId}/review`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        rating,
        comment,
        isAnonymous, // ตรงกับ CreateReviewDto ของคุณแล้ว
      }),
    });

    if (!res.ok) {
      const t = await res.text().catch(() => "");
      throw new Error(t || "submit failed");
    }

    router.push(`/course/${courseCode}`); // หรือหน้าไหนที่คุณอยากให้กลับไป
  } catch (e: any) {
    setErr(e?.message || "บันทึกรีวิวไม่สำเร็จ (เช็ค backend/permission)");
  }
}


  // ตอน redirect ไป login จะมองไม่ทัน แต่ให้เผื่อ UI
  if (!token) return <div className="pt-28 px-6">กำลังพาไปเข้าสู่ระบบ...</div>;

  return (
    <main className="w-full min-h-screen pt-28 pb-16 px-4 sm:px-8">
      <section className="max-w-3xl mx-auto">
        <div className="rounded-3xl bg-white/85 shadow-md p-6">
          <h1 className="text-2xl font-extrabold">เขียนรีวิวรายวิชา</h1>
          <p className="text-sm text-gray-600 mt-1">รหัสวิชา: {courseCode}</p>

          <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="mt-6 flex flex-col gap-5">
            {/* rating */}
            <div>
              <p className="font-semibold mb-2">ให้คะแนน</p>
              <div className="flex items-center gap-2">
                {Array.from({ length: 5 }).map((_, i) => {
                  const v = i + 1;
                  const active = v <= rating;
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setRating(v)}
                      className="text-2xl"
                      aria-label={`rate ${v}`}
                    >
                      <span className={active ? "text-[#FFB800]" : "text-gray-300"}>
                        ★
                      </span>
                    </button>
                  );
                })}
                <span className="text-sm text-gray-600 ml-2">{rating}/5</span>
              </div>
            </div>

            {/* comment */}
            <div>
              <p className="font-semibold mb-2">ความคิดเห็น</p>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={5}
                placeholder="เล่าได้เลยว่าเรียนเป็นยังไง..."
                className="w-full rounded-2xl border border-black/10 bg-white/90 p-4 outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>

            {/* anonymous */}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
              />
              โพสต์แบบไม่ระบุตัวตน
            </label>

            {err && <p className="text-sm text-red-600">{err}</p>}

            <div className="flex items-center gap-3">
              <button
                disabled={loading}
                className="rounded-2xl px-5 py-3 font-bold bg-black text-white hover:bg-black/80 disabled:opacity-60"
              >
                {loading ? "กำลังบันทึก..." : "ส่งรีวิว"}
              </button>

              <button
                type="button"
                className="rounded-2xl px-5 py-3 font-semibold bg-black/5 hover:bg-black/10"
                onClick={() => router.back()}
              >
                ย้อนกลับ
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
