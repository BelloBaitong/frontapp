"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { getToken, setReturnTo } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default function NewReviewPage() {
  const router = useRouter();
  const params = useParams<{ courseCode: string }>();
  const searchParams = useSearchParams();

  const courseCode = params.courseCode;
  const token = useMemo(() => getToken(), []);

  const mode = searchParams.get("mode");
  const reviewId = searchParams.get("reviewId");
  const isEditMode = mode === "edit" && !!reviewId;

  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingReview, setLoadingReview] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setReturnTo(`/course/${courseCode}/review`);
      window.location.href = `${API_BASE}/auth/google`;
    }
  }, [token, courseCode]);

  useEffect(() => {
    if (!token || !isEditMode || !reviewId) return;

    async function fetchReviewDetail() {
      try {
        setLoadingReview(true);
        setErr(null);

        const res = await fetch(`${API_BASE}/review/${reviewId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        if (!res.ok) {
          const t = await res.text().catch(() => "");
          throw new Error(t || "โหลดรีวิวไม่สำเร็จ");
        }

        const data = await res.json();
        setRating(data.rating ?? 5);
        setComment(data.comment ?? "");
        setIsAnonymous(Boolean(data.isAnonymous));
      } catch (e: any) {
        setErr(e?.message || "โหลดข้อมูลรีวิวไม่สำเร็จ");
      } finally {
        setLoadingReview(false);
      }
    }

    fetchReviewDetail();
  }, [token, isEditMode, reviewId]);

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
    setErr(null);

    const token = getToken();
    if (!token) {
      setErr("กรุณาเข้าสู่ระบบก่อน");
      return;
    }

    try {
      setLoading(true);

      let res: Response;

      if (isEditMode && reviewId) {
        res = await fetch(`${API_BASE}/review/${reviewId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            rating,
            comment,
            isAnonymous,
          }),
        });
      } else {
        const courseId = await fetchCourseIdByCode(courseCode, token);

        res = await fetch(`${API_BASE}/course/${courseId}/review`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            rating,
            comment,
            isAnonymous,
          }),
        });
      }

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || (isEditMode ? "update failed" : "submit failed"));
      }

      router.push(`/course/${courseCode}`);
    } catch (e: any) {
      setErr(
        e?.message ||
          (isEditMode ? "บันทึกการแก้ไขไม่สำเร็จ" : "บันทึกรีวิวไม่สำเร็จ")
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    const token = getToken();
    if (!token || !reviewId) return;

    const confirmed = window.confirm("ต้องการลบรีวิวนี้ใช่หรือไม่?");
    if (!confirmed) return;

    try {
      setLoading(true);
      setErr(null);

      const res = await fetch(`${API_BASE}/review/${reviewId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || "delete failed");
      }

      router.push(`/course/${courseCode}`);
    } catch (e: any) {
      setErr(e?.message || "ลบรีวิวไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  if (!token) return <div className="pt-28 px-6">กำลังพาไปเข้าสู่ระบบ...</div>;
  if (loadingReview) return <div className="pt-28 px-6">กำลังโหลดข้อมูลรีวิว...</div>;

  return (
    <main className="w-full min-h-screen pt-28 pb-16 px-4 sm:px-8">
      <section className="max-w-3xl mx-auto">
        <div className="rounded-3xl bg-white/85 shadow-md p-6">
          <h1 className="text-2xl font-extrabold">
            {isEditMode ? "แก้ไขรีวิวรายวิชา" : "เขียนรีวิวรายวิชา"}
          </h1>
          <p className="text-sm text-gray-600 mt-1">รหัสวิชา: {courseCode}</p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
            className="mt-6 flex flex-col gap-5"
          >
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

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
              />
              โพสต์แบบไม่ระบุตัวตน
            </label>

            {err && <p className="text-sm text-red-600">{err}</p>}

            <div className="flex items-center gap-3 flex-wrap">
              <button
                disabled={loading}
                className="rounded-2xl px-5 py-3 font-bold bg-black text-white hover:bg-black/80 disabled:opacity-60"
              >
                {loading
                  ? "กำลังบันทึก..."
                  : isEditMode
                  ? "บันทึกการแก้ไข"
                  : "ส่งรีวิว"}
              </button>

              {isEditMode && (
                <button
                  type="button"
                  disabled={loading}
                  className="rounded-2xl px-5 py-3 font-semibold bg-red-500 text-white hover:bg-red-600 disabled:opacity-60"
                  onClick={handleDelete}
                >
                  ลบรีวิว
                </button>
              )}

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