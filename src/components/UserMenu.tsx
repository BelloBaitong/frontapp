"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { clearToken, getToken, parseJwt } from "@/lib/auth";

type JwtUser = {
  sub?: string | number;
  email?: string;
  name?: string;
  picture?: string;
};

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const [token, setTokenState] = useState<string | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    // init
    setTokenState(getToken());

    // sync ระหว่าง tab/หรือหลัง callback
    const onStorage = () => setTokenState(getToken());
    window.addEventListener("storage", onStorage);

    // เผื่อ token เปลี่ยนใน tab เดียวกัน (หลัง login) ให้ refresh state
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

  if (!token) return null;

  const displayName = user?.name || user?.email || "Student";

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="h-10 w-10 rounded-full bg-white/70 border border-white/60 shadow flex items-center justify-center hover:bg-white/90 transition"
        aria-label="User menu"
      >
        {/* ถ้ามีรูปจาก JWT ใช้รูป, ถ้าไม่มีก็ใช้ไอคอน */}
        {user?.picture ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.picture}
            alt="avatar"
            className="h-9 w-9 rounded-full object-cover"
          />
        ) : (
          <span className="text-xl">👤</span>
        )}
      </button>

      {open && (
        <>
          <div className="absolute right-0 mt-3 w-72 rounded-2xl bg-white/95 shadow-xl border border-black/5 overflow-hidden z-50">
            <div className="p-4">
              <p className="text-sm text-gray-500">ลงชื่อเข้าใช้แล้ว</p>
              <p className="font-bold text-gray-900 truncate">{displayName}</p>
              {user?.email && (
                <p className="text-sm text-gray-600 truncate">{user.email}</p>
              )}
            </div>

            <div className="border-t border-black/5 p-2">
              <button
                type="button"
                onClick={() => {
                  clearToken();
                  setTokenState(null);
                  setOpen(false);
                  window.location.href = "/"; // รีเฟรชสถานะ
                }}
                className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold hover:bg-black/5 transition"
              >
                ออกจากระบบ
              </button>
            </div>
          </div>

          {/* click outside */}
          <div
            className="fixed inset-0 z-40"
            onMouseDown={() => setOpen(false)}
          />
        </>
      )}
    </div>
  );
}
