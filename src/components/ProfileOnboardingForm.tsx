"use client";

import React, { useMemo, useState } from "react";
import type { UserProfile, StudyYear } from "@/types/userProfile";
import { DEFAULT_INTERESTS, DEFAULT_CAREER_GOALS } from "@/types/userProfile";
import CustomButton from "@/components/CustomButton";

function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

/** ===== UI: Stepper ===== */
function Stepper({ step }: { step: 1 | 2 }) {
  const items = [
    { n: 1, label: "พื้นฐาน" },
    { n: 2, label: "อาชีพ" },
  ] as const;

  return (
    <div className="rounded-2xl bg-white/55 ring-1 ring-black/5 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        {items.map((it, idx) => {
          const active = step === it.n;
          const done = step > it.n;

          return (
            <div key={it.n} className="flex items-center gap-3 flex-1">
              <div
                className={cn(
                  "h-9 w-9 rounded-full grid place-items-center font-extrabold text-sm ring-1 transition",
                  done
                    ? "bg-emerald-500 text-white ring-emerald-500"
                    : active
                    ? "bg-white text-gray-900 ring-black/15 shadow-sm"
                    : "bg-white/40 text-gray-600 ring-black/10"
                )}
              >
                {done ? "✓" : it.n}
              </div>

              <div className="min-w-0">
                <p
                  className={cn(
                    "text-sm font-bold truncate",
                    active ? "text-gray-900" : "text-gray-700"
                  )}
                >
                  Step {it.n}
                </p>
                <p className="text-xs text-gray-600 truncate">{it.label}</p>
              </div>

              {idx < items.length - 1 && (
                <div className="h-[2px] flex-1 rounded-full bg-black/10 mx-2" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** ===== UI: Card ===== */
function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl bg-white/70 ring-1 ring-black/5 shadow-sm overflow-hidden">
      <header className="px-6 py-5 border-b border-black/5 bg-white/60">
        <h2 className="text-xl font-extrabold text-gray-900">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
      </header>
      <div className="px-6 py-6">{children}</div>
    </section>
  );
}

/** ===== UI: Pill ===== */
function Pill({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1.5 text-sm font-semibold transition select-none",
        "ring-1 shadow-sm",
        active
          ? "bg-gray-900 text-white ring-gray-900/60"
          : "bg-white/60 text-gray-800 ring-black/10 hover:bg-white/80"
      )}
    >
      <span className="inline-flex items-center gap-2">
        {active && <span className="text-xs">✓</span>}
        {children}
      </span>
    </button>
  );
}

/** ===== UI: Selected Summary ===== */
function SelectedLine({
  label,
  values,
  placeholder,
}: {
  label: string;
  values: string[];
  placeholder: string;
}) {
  return (
    <div className="mt-3 rounded-2xl bg-white/50 ring-1 ring-black/5 px-4 py-3">
      <p className="text-xs font-bold text-gray-700">{label}</p>
      <p className="mt-1 text-sm text-gray-800">
        {values.length ? (
          values.join(", ")
        ) : (
          <span className="text-gray-500">{placeholder}</span>
        )}
      </p>
    </div>
  );
}

export default function ProfileOnboardingForm({
  onSubmit,
  loading = false,
}: {
  onSubmit: (profile: UserProfile) => Promise<void> | void;
  loading?: boolean;
}) {
  const [step, setStep] = useState<1 | 2>(1);

  const [year, setYear] = useState<StudyYear | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [careerGoals, setCareerGoals] = useState<string[]>([]);

  const canNextStep1 = year !== null && interests.length >= 3;
  const canSubmit = canNextStep1 && careerGoals.length >= 1;

  // เพิ่ม interests ตามที่คุณให้มา (กันซ้ำ ถ้ามีอยู่แล้วไม่เพิ่ม)
  const mergedInterests = useMemo(() => {
    const extra = [
      "AI / Machine Learning",
      "Computer Vision",
      "Data Science",
      "Data Engineering",
      "Web Development (Frontend)",
      "Backend Development",
      "Mobile App",
      "Cloud Computing",
      "Cybersecurity",
      "DevOps",
      "Software Engineering",
      "Database Systems",
      "UX/UI",
      "Software Testing",
      "Game Development",
      "IoT",
      "Embedded Systems",
      "Research / Academic",
      "Tech Business / Product",
    ];

    const set = new Set<string>(DEFAULT_INTERESTS.map((x) => String(x).trim()));
    for (const x of extra) set.add(x.trim());
    return Array.from(set);
  }, []);

  const hint = useMemo(() => {
    if (step === 1) return "เลือกชั้นปี + ความสนใจอย่างน้อย 3 หัวข้อ";
    return "เลือกอาชีพที่สนใจอย่างน้อย 1 อาชีพ";
  }, [step]);

  const toggle = (
    list: string[],
    value: string,
    max: number,
    set: (v: string[]) => void
  ) => {
    if (list.includes(value)) {
      set(list.filter((x) => x !== value));
      return;
    }
    if (list.length >= max) return;
    set([...list, value]);
  };

  const goNext = () => setStep((s) => (s === 1 ? 2 : 2));
  const goBack = () => setStep((s) => (s === 2 ? 1 : 1));

  const handleSubmit = async () => {
    if (!canSubmit || year === null) return;

    const now = new Date().toISOString();
    const profile: UserProfile = {
      year,
      interests,
      careerGoals,
      createdAt: now,
      updatedAt: now,
      difficultyPreference: "easy",
      learningStyle: "project"
    };

    await onSubmit(profile);
  };

  /** ใช้ CSS เพื่อทำให้ "disabled" เห็นชัด โดยไม่ต้องแก้ CustomButton */
  const disabledStyles = "opacity-50 pointer-events-none";

  return (
    <div className="space-y-4">
      <Stepper step={step} />

      <div className="rounded-2xl bg-white/40 ring-1 ring-black/5 px-4 py-3">
        <p className="text-sm text-gray-700">
          <span className="font-bold">คำใบ้:</span> {hint}
        </p>
      </div>

      {/* ===== STEP 1 ===== */}
      {step === 1 && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Card
            title="ข้อมูลพื้นฐาน"
            subtitle="ช่วยให้ระบบแนะนำวิชาได้เหมาะกับระดับของคุณ"
          >
            <div className="space-y-6">
              <div>
                <p className="text-sm font-bold text-gray-800 mb-2">
                  ชั้นปีการศึกษา
                </p>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4].map((y) => (
                    <Pill
                      key={y}
                      active={year === y}
                      onClick={() => setYear(y as StudyYear)}
                    >
                      ปี {y}
                    </Pill>
                  ))}
                </div>

                <SelectedLine
                  label="ชั้นปีที่เลือก"
                  values={year ? [`ปี ${year}`] : []}
                  placeholder="ยังไม่ได้เลือก"
                />
              </div>

              <div>
                <div className="flex items-end justify-between mb-2">
                  <p className="text-sm font-bold text-gray-800">
                    ความสนใจ (เลือก 3–5)
                  </p>
                  <p className="text-xs text-gray-600">
                    เลือกแล้ว {interests.length}/5
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {mergedInterests.map((tag) => (
                    <Pill
                      key={tag}
                      active={interests.includes(tag)}
                      onClick={() => toggle(interests, tag, 5, setInterests)}
                    >
                      {tag}
                    </Pill>
                  ))}
                </div>

                <SelectedLine
                  label="ความสนใจที่เลือก"
                  values={interests}
                  placeholder="เลือกอย่างน้อย 3 หัวข้อ"
                />

                {interests.length > 0 && interests.length < 3 && (
                  <p className="mt-2 text-xs font-semibold text-rose-700">
                    ต้องเลือกอย่างน้อย 3 หัวข้อ
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <div className={cn(!canNextStep1 && disabledStyles)}>
                  <CustomButton
                    title="ถัดไป"
                    btnType="button"
                    handleClick={goNext}
                    containerStyles=""
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ===== STEP 2 ===== */}
      {step === 2 && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Card
            title="เป้าหมายอาชีพ"
            subtitle="เพื่อให้ระบบจัดลำดับรายวิชาให้ตรงสายที่คุณอยากไป"
          >
            <div className="space-y-6">
              <div>
                <div className="flex items-end justify-between mb-2">
                  <p className="text-sm font-bold text-gray-800">
                    อาชีพที่สนใจ (เลือก 1–5)
                  </p>
                  <p className="text-xs text-gray-600">
                    เลือกแล้ว {careerGoals.length}/5
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {DEFAULT_CAREER_GOALS.map((goal) => (
                    <Pill
                      key={goal}
                      active={careerGoals.includes(goal)}
                      onClick={() => toggle(careerGoals, goal, 5, setCareerGoals)}
                    >
                      {goal}
                    </Pill>
                  ))}
                </div>

                <SelectedLine
                  label="อาชีพที่เลือก"
                  values={careerGoals}
                  placeholder="เลือกอย่างน้อย 1 อาชีพ"
                />

                {careerGoals.length === 0 && (
                  <p className="mt-2 text-xs font-semibold text-rose-700">
                    ต้องเลือกอย่างน้อย 1 อาชีพ
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={goBack}
                  className="text-sm font-bold text-gray-700 hover:text-gray-900"
                >
                  ย้อนกลับ
                </button>

                {/* เสร็จสิ้น */}
                <div className={cn(!canSubmit && disabledStyles)}>
                  <CustomButton
                    title={loading ? "กำลังบันทึก..." : "เสร็จสิ้น"}
                    btnType="button"
                    handleClick={handleSubmit}
                    containerStyles=""
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}