"use client";

import type { Course } from "@/types/course";
import type { Review } from "@/types/review";
import WriteReviewButton from "@/components/WriteReviewButton";
import { useEffect, useState , useMemo } from "react";
import { getToken } from "@/lib/auth";



function formatCategoryTh(category?: string) {
  if (!category) return "-";
  if (category === "ELECTIVE") return "วิชาเลือก";
  if (category === "GENERAL") return "วิชาศึกษาทั่วไป";
  return category; // เผื่อมีค่าอื่น
}

function calcAvgRating(reviews: Review[]) {
  if (!reviews || reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
  return sum / reviews.length;
}

function StarRow({ rating }: { rating: number }) {
  // แสดงดาวตามค่าเฉลี่ยแบบปัดใกล้สุด (จะให้ละเอียดขึ้นก็ได้)
  const full = Math.round(rating);
  return (
    <div className="flex items-center gap-1 text-[#FFB800]">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className="text-sm">
          {i < full ? "★" : "☆"}
        </span>
      ))}
    </div>
  );
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  // ถ้าอยากให้เป็นรูปแบบไทยมากขึ้นค่อยปรับภายหลัง
  return d.toLocaleString();
}

type AiSummaryResponse = {
  ok?: boolean;
  courseCode?: string;
  status: "OK" | "INSUFFICIENT_DATA" | string;
  summary: string | null;
};
function parseJwt(token: string | null): Record<string, any> | null {
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = window.atob(normalized);

    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export default function CourseDetailSection({
  course,
  reviews,
}: {
  course: Course;
  reviews: Review[];
}) {
  const avgRating = calcAvgRating(reviews);
  const reviewCount = reviews?.length ?? 0;

  const titleEn = course.courseNameEn ?? "-";
  const titleTh = course.courseNameTh ?? "-";
  const categoryTh = formatCategoryTh(course.category);

  const [ai, setAi] = useState<AiSummaryResponse | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const token = useMemo(() => getToken(), []);
  const me = useMemo(() => parseJwt(token), [token]);

const myReview = useMemo(() => {
  if (!me) return undefined;

  return reviews.find((r: any) => {
    const reviewUserId = r.userId ?? r.user?.id;
    const reviewUserEmail = r.userEmail ?? r.user?.email;

    return (
      (me.id != null &&
        reviewUserId != null &&
        Number(reviewUserId) === Number(me.id)) ||
      (me.email &&
        reviewUserEmail &&
        String(reviewUserEmail).toLowerCase() ===
          String(me.email).toLowerCase()) ||
      (me.sub != null &&
        reviewUserId != null &&
        String(reviewUserId) === String(me.sub))
    );
  });
}, [reviews, me]);

  useEffect(() => {
    let cancelled = false;

    async function loadAiSummary() {
      setAiLoading(true);
      setAiError(null);

      try {
        const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
        const url = `${base}/course/${course.courseCode}/ai-summary`;
        console.log("AI summary url:", url);

        const res = await fetch(url, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            });
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(text || `Request failed: ${res.status}`);
        }

        const data = (await res.json()) as AiSummaryResponse;

        if (cancelled) return;
        setAi(data);
      } catch (e: any) {
        if (cancelled) return;
        setAiError(e?.message ?? "โหลดสรุปจาก AI ไม่สำเร็จ");
        // fallback: ให้กล่องไม่พัง
        setAi({ status: "INSUFFICIENT_DATA", summary: null });
      } finally {
        if (!cancelled) setAiLoading(false);
      }
    }

    loadAiSummary();
    return () => {
      cancelled = true;
    };
  }, [course.courseCode, reviewCount]);

  

  return (
    <main className="w-full min-h-screen pt-28 pb-16 px-4 sm:px-8">
      <section className="mx-auto w-full max-w-6xl flex flex-col gap-6">
        {/* ========== TOP: Course Summary Card ========== */}
        <div className="rounded-3xl bg-white/80 backdrop-blur-md shadow-lg border border-white/40 overflow-hidden">
          {/* Header */}
          <div className="p-6 sm:p-8">
            <p className="text-[#4A9FD8] font-extrabold text-2xl sm:text-3xl">
              {course.courseCode}
            </p>

            <h1 className="mt-1 text-2xl sm:text-4xl font-extrabold uppercase text-black">
              {titleEn}
            </h1>

            <p className="mt-1 text-base sm:text-lg text-gray-700">{titleTh}</p>

            {/* chips */}
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-black/5 px-3 py-1 text-sm">
                หน่วยกิต: <b>{course.credits ?? "-"}</b>
              </span>
              <span className="rounded-full bg-black/5 px-3 py-1 text-sm">
                หมวด: <b>{categoryTh}</b>
              </span>
            </div>

            {/* description */}
            <div className="mt-5">
              <h2 className="font-bold text-lg text-black">คำอธิบายรายวิชา</h2>
              <p className="mt-2 text-gray-700 leading-relaxed whitespace-pre-line">
                {course.description ?? "-"}
              </p>
            </div>
          </div>

          {/* Summary footer */}
          <div className="border-t border-black/10 bg-white/50">
            <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white/70 border border-black/5 p-4">
                <p className="text-sm text-gray-600">คะแนนเฉลี่ย</p>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <p className="text-3xl font-extrabold text-black">
                      {avgRating.toFixed(1)}
                    </p>
                    <StarRow rating={avgRating} />
                  </div>
                </div>
              </div>

                 {/* สรุปจาก AI */}
             <div className="rounded-2xl bg-white/70 border border-black/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-gray-600">สรุปจาก AI</p>
                    {aiLoading ? (
                      <span className="text-xs text-gray-500">✨</span>
                    ) : null}
                  </div>

                  <div className="mt-2">
                    {ai?.summary ? (
                      <>
                        <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                          {ai.summary}
                        </p>

                        {ai.status === "NO_REVIEWS" && (
                          <p className="mt-2 text-xs text-amber-600">
                            วิชานี้ยังไม่มีรีวิวจากนักศึกษา สรุปนี้อ้างอิงจากคำอธิบายรายวิชาเป็นหลัก
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-gray-500 leading-relaxed">
                        กำลังสรุปข้อมูล...
                      </p>
                    )}

                    {aiError ? (
                      <p className="mt-2 text-xs text-red-500">{aiError}</p>
                    ) : null}
                  </div>
                </div>

                {/* <div className="rounded-2xl bg-white/70 border border-black/5 p-4 ml-auto text-right">
                <p className="text-sm text-gray-600">จำนวนรีวิว</p>
                <p className="mt-2 text-3xl font-extrabold text-black">
                    {reviewCount}
                </p>
                <p className="text-sm text-gray-600">รายการ</p>
                </div> */}
            </div>
          </div>
        </div>

        {/* ========== REVIEWS ========== */}
        <div className="rounded-3xl bg-white/80 backdrop-blur-md shadow-lg border border-white/40 p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl sm:text-2xl font-extrabold text-black">
              รีวิวรายวิชา
            </h2>
            <WriteReviewButton
            courseCode={course.courseCode}
            hasReviewed={!!myReview}
            reviewId={myReview?.id}
            />
          </div>

           <p className="text-sm text-gray-600">
            ทั้งหมด {reviewCount} รีวิว
            </p>

          {reviewCount === 0 ? (
            <div className="mt-4 rounded-2xl bg-white/70 border border-black/5 p-5 text-gray-600">
              ยังไม่มีรีวิว
            </div>
          ) : (
            <div className="mt-5 flex flex-col gap-4">
              {reviews.map((r) => (
                <div
                  key={r.id}
                  className="rounded-2xl bg-white/70 border border-black/5 p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-bold text-black">
                            {r.isAnonymous ? "ไม่ระบุชื่อ" : (r.userName ?? r.userEmail ?? "ผู้ใช้")}
                        </p>

                      <p className="text-xs text-gray-500">
                        {formatDateTime(r.createdAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <StarRow rating={r.rating} />
                      <span className="text-sm font-bold text-[#FFB800]">
                        {Number(r.rating).toFixed(0)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl bg-white/70 border border-black/5 p-4">
                    <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                      {r.comment}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
