"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { clearToken, getToken, parseJwt } from "@/lib/auth";
import { userProfileGetMe, type UserProfileDto } from "@/lib/api";

type JwtUser = {
  sub?: string | number;
  email?: string;
  name?: string;
  picture?: string;
};

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const [token, setTokenState] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfileDto | null>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setTokenState(getToken());

    const onStorage = () => setTokenState(getToken());
    window.addEventListener("storage", onStorage);

    const t = window.setInterval(() => setTokenState(getToken()), 500);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.clearInterval(t);
    };
  }, []);

  const user = useMemo(() => {
    if (!token) return null;
    return parseJwt<JwtUser>(token);
  }, [token]);

  useEffect(() => {
    if (!token) {
      setProfile(null);
      return;
    }

    let cancelled = false;

    const fetchProfile = async () => {
      try {
        const data = await userProfileGetMe();
        if (!cancelled) {
          setProfile(data);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        if (!cancelled) {
          setProfile(null);
        }
      }
    };

    fetchProfile();

    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    setImgError(false);
  }, [user?.picture]);

  if (!token) return null;

  const displayName = user?.name || user?.email || "Student";
  const hasPicture = !!user?.picture && !imgError;

  const completedCourses = profile?.courses ?? [];

 const renderCoursesList = () => {
  const list = Array.isArray(completedCourses) ? completedCourses : [];

  return (
    <div className="mt-3">
      <p className="text-sm text-gray-500">วิชาที่เคยเรียนแล้ว:</p>

      {list.length > 0 ? (
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {list.map((course, index) => {
            const code = course?.courseCode ?? course?.code ?? "";
            const nameTh = course?.courseNameTh ?? "-";

            return (
              <li
                key={course?.id ?? `${code}-${index}`}
                className="text-sm font-semibold text-gray-900"
              >
                {code ? `${code} — ${nameTh}` : nameTh}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm font-semibold text-gray-900">
          ยังไม่ได้เลือกวิชาที่เคยเรียนแล้ว
        </p>
      )}
    </div>
  );
};

  const handleEditClick = () => {
    window.location.href = "/onboarding";
  };

  return (
    <div className="relative">
      <div
        ref={triggerRef}
        role="button"
        tabIndex={0}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((v) => !v);
          }
          if (e.key === "Escape") setOpen(false);
        }}
        className="flex h-10 w-10 cursor-pointer select-none items-center justify-center rounded-full border border-white/60 bg-white/70 shadow outline-none transition hover:bg-white/90 focus:ring-2 focus:ring-black/10"
        aria-label="User menu"
        aria-expanded={open}
      >
        {hasPicture ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user!.picture!}
            alt="avatar"
            className="h-9 w-9 rounded-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="text-xl leading-none">👤</span>
        )}
      </div>

      {open && (
        <>
          <div className="absolute right-0 z-50 mt-3 w-72 overflow-hidden rounded-2xl border border-black/5 bg-white/95 shadow-xl">
            <div className="p-4">
              <p className="text-sm text-gray-500">ลงชื่อเข้าใช้แล้ว</p>
              <p className="truncate font-bold text-gray-900">{displayName}</p>
              {user?.email && (
                <p className="truncate text-sm text-gray-600">{user.email}</p>
              )}
            </div>

            {profile && (
              <div className="p-4 pt-0">
                <p className="text-sm text-gray-500">ความสนใจ:</p>
                <p className="font-semibold text-gray-900">
                  {profile.interests?.join(", ") || "ไม่มีความสนใจที่เลือกไว้"}
                </p>

                <p className="mt-2 text-sm text-gray-500">อาชีพที่สนใจ:</p>
                <p className="font-semibold text-gray-900">
                  {profile.careerGoals?.join(", ") || "ไม่มีอาชีพที่สนใจ"}
                </p>

                {renderCoursesList()}
              </div>
            )}

            <div className="border-t border-black/5 p-2">
              <button
                type="button"
                onClick={handleEditClick}
                className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold transition hover:bg-black/5"
              >
                แก้ไขข้อมูลโปรไฟล์
              </button>

              <button
                type="button"
                onClick={() => {
                  clearToken();
                  setTokenState(null);
                  setOpen(false);
                  window.location.href = "/";
                }}
                className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold transition hover:bg-black/5"
              >
                ออกจากระบบ
              </button>
            </div>
          </div>

          <div className="fixed inset-0 z-40" onMouseDown={() => setOpen(false)} />
        </>
      )}
    </div>
  );
}