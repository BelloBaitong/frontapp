"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { Course } from "@/types/course";
import type { UserProfile, StudyYear } from "@/types/userProfile";
import { DEFAULT_INTERESTS, DEFAULT_CAREER_GOALS } from "@/types/userProfile";
import { searchCourses } from "@/lib/api";
import CustomButton from "@/components/CustomButton";

function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function isSameText(a: string, b: string) {
  return normalizeText(a).toLowerCase() === normalizeText(b).toLowerCase();
}

function Stepper({ step }: { step: 1 | 2 | 3 }) {
  const items = [
    { n: 1, label: "พื้นฐาน" },
    { n: 2, label: "อาชีพ" },
    { n: 3, label: "วิชาที่เคยเรียนแล้ว" },
  ] as const;

  return (
    <div className="rounded-2xl bg-white/55 px-4 py-3 ring-1 ring-black/5">
      <div className="flex items-center justify-between gap-3">
        {items.map((it, idx) => {
          const active = step === it.n;
          const done = step > it.n;

          return (
            <div key={it.n} className="flex flex-1 items-center gap-3">
              <div
                className={cn(
                  "grid h-9 w-9 place-items-center rounded-full text-sm font-extrabold ring-1 transition",
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
                    "truncate text-sm font-bold",
                    active ? "text-gray-900" : "text-gray-700"
                  )}
                >
                  Step {it.n}
                </p>
                <p className="truncate text-xs text-gray-600">{it.label}</p>
              </div>

              {idx < items.length - 1 && (
                <div className="mx-2 h-[2px] flex-1 rounded-full bg-black/10" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

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
    <section className="overflow-hidden rounded-3xl bg-white/70 shadow-sm ring-1 ring-black/5">
      <header className="border-b border-black/5 bg-white/60 px-6 py-5">
        <h2 className="text-xl font-extrabold text-gray-900">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
      </header>
      <div className="px-6 py-6">{children}</div>
    </section>
  );
}

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
        "select-none rounded-full px-3 py-1.5 text-sm font-semibold transition ring-1 shadow-sm",
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

function SelectedChipList({
  values,
  onRemove,
  emptyText,
}: {
  values: string[];
  onRemove: (value: string) => void;
  emptyText: string;
}) {
  if (values.length === 0) {
    return <p className="text-sm text-gray-500">{emptyText}</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {values.map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => onRemove(value)}
          className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-3 py-1.5 text-sm font-semibold text-white shadow-sm"
        >
          <span>{value}</span>
          <span className="text-xs opacity-80">✕</span>
        </button>
      ))}
    </div>
  );
}

function InputAddBox({
  label,
  description,
  placeholder,
  inputValue,
  onInputChange,
  onAdd,
}: {
  label: string;
  description: string;
  placeholder: string;
  inputValue: string;
  onInputChange: (value: string) => void;
  onAdd: () => void;
}) {
  return (
    <div className="mt-4 rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
      <div className="mb-2">
        <p className="text-sm font-bold text-gray-800">{label}</p>
        <p className="mt-1 text-xs text-gray-600">{description}</p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAdd();
            }
          }}
          placeholder={placeholder}
          className="h-11 flex-1 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-400"
        />

        <button
          type="button"
          onClick={onAdd}
          className="h-11 rounded-xl bg-gray-900 px-4 text-sm font-bold text-white transition hover:opacity-90"
        >
          เพิ่ม
        </button>
      </div>
    </div>
  );
}

function SelectedCourseList({
  values,
  onRemove,
}: {
  values: Course[];
  onRemove: (courseId: number) => void;
}) {
  if (values.length === 0) {
    return <p className="text-sm text-gray-500">ยังไม่ได้เลือกวิชาที่เคยเรียนแล้ว</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {values.map((course) => (
        <button
          key={course.id}
          type="button"
          onClick={() => onRemove(course.id)}
          className="inline-flex max-w-full items-center gap-2 rounded-full bg-gray-900 px-3 py-1.5 text-left text-sm font-semibold text-white shadow-sm"
        >
          <span className="truncate">
            {course.courseCode} · {course.courseNameTh}
          </span>
          <span className="text-xs opacity-80">✕</span>
        </button>
      ))}
    </div>
  );
}

function CourseResultList({
  courses,
  onSelect,
}: {
  courses: Course[];
  onSelect: (course: Course) => void;
}) {
  if (courses.length === 0) return null;

  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {courses.map((course) => (
        <button
          key={course.id}
          type="button"
          onClick={() => onSelect(course)}
          className="flex w-full flex-col items-start gap-1 border-b border-gray-100 px-4 py-3 text-left transition hover:bg-gray-50 last:border-b-0"
        >
          <div className="flex w-full items-center justify-between gap-3">
            <p className="text-sm font-bold text-gray-900">
              {course.courseCode}
            </p>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">
              {course.category}
            </span>
          </div>

          <p className="text-sm text-gray-800">{course.courseNameTh}</p>

          {course.courseNameEn ? (
            <p className="text-xs text-gray-500">{course.courseNameEn}</p>
          ) : null}
        </button>
      ))}
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
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [year, setYear] = useState<StudyYear | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [careerGoals, setCareerGoals] = useState<string[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);

  const [customInterestInput, setCustomInterestInput] = useState("");
  const [customCareerGoalInput, setCustomCareerGoalInput] = useState("");

  const [courseQuery, setCourseQuery] = useState("");
  const [courseResults, setCourseResults] = useState<Course[]>([]);
  const [searchingCourses, setSearchingCourses] = useState(false);
  const [courseSearchMessage, setCourseSearchMessage] = useState("");

  const canNextStep1 = year !== null && interests.length >= 1;
  const canNextStep2 = careerGoals.length >= 1;
  const canSubmit = canNextStep2;

  const hint = useMemo(() => {
    if (step === 1) {
      return "เลือกหรือพิมพ์ความสนใจเองได้ ไม่จำกัดจำนวน แต่แนะนำประมาณ 3–8 หัวข้อเพื่อให้คำแนะนำแม่นขึ้น";
    }

    if (step === 2) {
      return "เลือกหรือพิมพ์อาชีพที่สนใจเองได้อย่างน้อย 1 อาชีพ";
    }

    return "ค้นหารายวิชาเลือกที่คุณเคยเรียนแล้วเพื่อให้ระบบรู้ว่าคุณมีสิทธิ์รีวิววิชาใดบ้าง";
  }, [step]);

  useEffect(() => {
    if (step !== 3) return;

    const trimmed = courseQuery.trim();

    if (trimmed.length < 2) {
      setCourseResults([]);
      setSearchingCourses(false);
      setCourseSearchMessage(
        trimmed.length === 0 ? "" : "พิมพ์อย่างน้อย 2 ตัวอักษรเพื่อค้นหารายวิชา"
      );
      return;
    }

    let cancelled = false;

    const timer = window.setTimeout(async () => {
      setSearchingCourses(true);
      setCourseSearchMessage("");

      try {
        const rows = await searchCourses(trimmed, 8);

        if (cancelled) return;

        const filtered = rows
          .filter((course) => course.category === "ELECTIVE")
          .filter(
            (course) => !selectedCourses.some((selected) => selected.id === course.id)
          );

        setCourseResults(filtered);

        if (filtered.length === 0) {
          setCourseSearchMessage("ไม่พบวิชาเลือกที่ตรงกับคำค้น");
        }
      } catch {
        if (cancelled) return;
        setCourseResults([]);
        setCourseSearchMessage("ค้นหารายวิชาไม่สำเร็จ กรุณาลองใหม่");
      } finally {
        if (!cancelled) {
          setSearchingCourses(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [courseQuery, selectedCourses, step]);

  const toggle = (
    list: string[],
    value: string,
    set: (v: string[]) => void
  ) => {
    const normalizedValue = normalizeText(value);
    const exists = list.some((item) => isSameText(item, normalizedValue));

    if (exists) {
      set(list.filter((item) => !isSameText(item, normalizedValue)));
      return;
    }

    set([...list, normalizedValue]);
  };

  const addUniqueItem = (
    list: string[],
    rawValue: string,
    set: (v: string[]) => void,
    clearInput: () => void
  ) => {
    const value = normalizeText(rawValue);
    if (!value) return;

    const exists = list.some((item) => isSameText(item, value));
    if (exists) {
      clearInput();
      return;
    }

    set([...list, value]);
    clearInput();
  };

  const removeInterest = (value: string) => {
    setInterests((prev) => prev.filter((item) => !isSameText(item, value)));
  };

  const removeCareerGoal = (value: string) => {
    setCareerGoals((prev) => prev.filter((item) => !isSameText(item, value)));
  };

  const addCustomInterest = () => {
    addUniqueItem(
      interests,
      customInterestInput,
      setInterests,
      () => setCustomInterestInput("")
    );
  };

  const addCustomCareerGoal = () => {
    addUniqueItem(
      careerGoals,
      customCareerGoalInput,
      setCareerGoals,
      () => setCustomCareerGoalInput("")
    );
  };

  const addCourse = (course: Course) => {
    setSelectedCourses((prev) => {
      if (prev.some((item) => item.id === course.id)) return prev;
      return [...prev, course];
    });

    setCourseQuery("");
    setCourseResults([]);
    setCourseSearchMessage("");
  };

  const removeCourse = (courseId: number) => {
    setSelectedCourses((prev) => prev.filter((item) => item.id !== courseId));
  };

  const goStep2 = () => setStep(2);
  const goStep1 = () => setStep(1);
  const goStep3 = () => setStep(3);
  const goStep2FromStep3 = () => setStep(2);

  const handleSubmit = async () => {
    if (!canSubmit || year === null) return;

    const now = new Date().toISOString();

    const profile: UserProfile = {
      year,
      interests,
      careerGoals,
      completedCourseIds: selectedCourses.map((course) => course.id),
      createdAt: now,
      updatedAt: now,
    };

    await onSubmit(profile);
  };

  const disabledStyles = "opacity-50 pointer-events-none";

  return (
    <div className="space-y-4">
      <Stepper step={step} />

      <div className="rounded-2xl bg-white/40 px-4 py-3 ring-1 ring-black/5">
        <p className="text-sm text-gray-700">
          <span className="font-bold">คำใบ้:</span> {hint}
        </p>
      </div>

      {/* ===== STEP 1 ===== */}
      {step === 1 && (
        <div className="animate-in slide-in-from-bottom-2 fade-in duration-200">
          <Card
            title="ข้อมูลพื้นฐาน"
            subtitle="ช่วยให้ระบบแนะนำวิชาได้เหมาะกับระดับของคุณ"
          >
            <div className="space-y-6">
              <div>
                <p className="mb-2 text-sm font-bold text-gray-800">
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

                <div className="mt-3 rounded-2xl bg-white/50 px-4 py-3 ring-1 ring-black/5">
                  <p className="text-xs font-bold text-gray-700">ชั้นปีที่เลือก</p>
                  <p className="mt-1 text-sm text-gray-800">
                    {year ? (
                      `ปี ${year}`
                    ) : (
                      <span className="text-gray-500">ยังไม่ได้เลือก</span>
                    )}
                  </p>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-end justify-between">
                  <p className="text-sm font-bold text-gray-800">ความสนใจ</p>
                  <p className="text-xs text-gray-600">
                    เลือก/กรอกแล้ว {interests.length} หัวข้อ
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {DEFAULT_INTERESTS.map((tag) => (
                    <Pill
                      key={tag}
                      active={interests.some((item) => isSameText(item, tag))}
                      onClick={() => toggle(interests, tag, setInterests)}
                    >
                      {tag}
                    </Pill>
                  ))}
                </div>

                <InputAddBox
                  label="ความสนใจอื่น ๆ"
                  description="ถ้าไม่มีในตัวเลือก สามารถพิมพ์เพิ่มเองได้ เช่น LLM, Computer Graphics, Prompt Engineering, Digital Twin"
                  placeholder="พิมพ์ความสนใจเพิ่มเติม"
                  inputValue={customInterestInput}
                  onInputChange={setCustomInterestInput}
                  onAdd={addCustomInterest}
                />

                <div className="mt-3 rounded-2xl bg-white/50 px-4 py-3 ring-1 ring-black/5">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-bold text-gray-700">
                      ความสนใจที่เลือก
                    </p>
                    <p className="text-xs text-gray-500">แนะนำ 3–8 หัวข้อ</p>
                  </div>

                  <SelectedChipList
                    values={interests}
                    onRemove={removeInterest}
                    emptyText="ยังไม่ได้เลือกหรือเพิ่มความสนใจ"
                  />
                </div>

                {interests.length > 0 && interests.length < 3 && (
                  <p className="mt-2 text-xs font-semibold text-amber-700">
                    สามารถไปต่อได้ แต่แนะนำให้มีอย่างน้อย 3 หัวข้อเพื่อให้ระบบแนะนำได้แม่นขึ้น
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <div className={cn(!canNextStep1 && disabledStyles)}>
                  <CustomButton
                    title="ถัดไป"
                    btnType="button"
                    handleClick={goStep2}
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
        <div className="animate-in slide-in-from-bottom-2 fade-in duration-200">
          <Card
            title="เป้าหมายอาชีพ"
            subtitle="เพื่อให้ระบบจัดลำดับรายวิชาให้ตรงสายที่คุณอยากไป"
          >
            <div className="space-y-6">
              <div>
                <div className="mb-2 flex items-end justify-between">
                  <p className="text-sm font-bold text-gray-800">อาชีพที่สนใจ</p>
                  <p className="text-xs text-gray-600">
                    เลือก/กรอกแล้ว {careerGoals.length} อาชีพ
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {DEFAULT_CAREER_GOALS.map((goal) => (
                    <Pill
                      key={goal}
                      active={careerGoals.some((item) => isSameText(item, goal))}
                      onClick={() => toggle(careerGoals, goal, setCareerGoals)}
                    >
                      {goal}
                    </Pill>
                  ))}
                </div>

                <InputAddBox
                  label="อาชีพอื่น ๆ"
                  description="ถ้าไม่มีในตัวเลือก สามารถพิมพ์เพิ่มเองได้ เช่น AI Product Manager, MLOps Engineer, Computer Vision Specialist, Technical Program Manager"
                  placeholder="พิมพ์อาชีพที่สนใจเพิ่มเติม"
                  inputValue={customCareerGoalInput}
                  onInputChange={setCustomCareerGoalInput}
                  onAdd={addCustomCareerGoal}
                />

                <div className="mt-3 rounded-2xl bg-white/50 px-4 py-3 ring-1 ring-black/5">
                  <p className="mb-2 text-xs font-bold text-gray-700">
                    อาชีพที่เลือก
                  </p>

                  <SelectedChipList
                    values={careerGoals}
                    onRemove={removeCareerGoal}
                    emptyText="เลือกหรือพิมพ์อย่างน้อย 1 อาชีพ"
                  />
                </div>

                {careerGoals.length === 0 && (
                  <p className="mt-2 text-xs font-semibold text-rose-700">
                    ต้องมีอย่างน้อย 1 อาชีพที่สนใจ
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={goStep1}
                  className="text-sm font-bold text-gray-700 hover:text-gray-900"
                >
                  ย้อนกลับ
                </button>

                <div className={cn(!canNextStep2 && disabledStyles)}>
                  <CustomButton
                    title="ถัดไป"
                    btnType="button"
                    handleClick={goStep3}
                    containerStyles=""
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {step === 3 && (
        <div className="animate-in slide-in-from-bottom-2 fade-in duration-200">
          <Card
            title="วิชาที่เคยเรียนแล้ว"
            subtitle="ค้นหาและเลือกรายวิชาเลือกที่คุณเคยเรียน เพื่อใช้กำหนดสิทธิ์การรีวิวในภายหลัง"
          >
            <div className="space-y-6">
              <div>
                <div className="mb-2 flex items-end justify-between">
                  <p className="text-sm font-bold text-gray-800">
                    ค้นหารายวิชาที่เคยเรียนแล้ว
                  </p>
                  <p className="text-xs text-gray-600">
                    เลือกแล้ว {selectedCourses.length} วิชา
                  </p>
                </div>

                <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                  <p className="mb-2 text-sm font-bold text-gray-800">
                    วิชาที่เคยเรียนแล้ว
                  </p>
                  <p className="mb-3 text-xs text-gray-600">
                    ค้นหาจากรหัสวิชา ชื่อไทย หรือชื่ออังกฤษ
                    ระบบจะแสดงเฉพาะวิชาเลือกให้เลือกก่อนในหน้านี้
                  </p>

                  <input
                    type="text"
                    value={courseQuery}
                    onChange={(e) => setCourseQuery(e.target.value)}
                    placeholder="เช่น 05506, Machine Learning, การออกแบบ"
                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-400"
                  />

                  {searchingCourses && (
                    <p className="mt-3 text-xs font-semibold text-gray-500">
                      กำลังค้นหารายวิชา...
                    </p>
                  )}

                  {!searchingCourses && courseSearchMessage && (
                    <p className="mt-3 text-xs font-semibold text-gray-500">
                      {courseSearchMessage}
                    </p>
                  )}

                  <CourseResultList courses={courseResults} onSelect={addCourse} />
                </div>

                <div className="mt-3 rounded-2xl bg-white/50 px-4 py-3 ring-1 ring-black/5">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-bold text-gray-700">
                      วิชาที่เลือกไว้
                    </p>
                    <p className="text-xs text-gray-500">
                      ถ้ายังไม่เลือก จะยังรีวิววิชาไม่ได้
                    </p>
                  </div>

                  <SelectedCourseList
                    values={selectedCourses}
                    onRemove={removeCourse}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={goStep2FromStep3}
                  className="text-sm font-bold text-gray-700 hover:text-gray-900"
                >
                  ย้อนกลับ
                </button>

                <CustomButton
                  title={loading ? "กำลังบันทึก..." : "เสร็จสิ้น"}
                  btnType="button"
                  handleClick={handleSubmit}
                  containerStyles={cn(loading && "pointer-events-none opacity-70")}
                />
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}