"use client";
import Link from "next/link"
import Image from "next/image"

import CustomButton from "./CustomButton"
import UserMenu from "./UserMenu";
import { getToken, setReturnTo } from "@/lib/auth";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";


export default function Navbar() {
  const router = useRouter();
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const sync = () => setIsAuthed(!!getToken());
    sync();

    // ✅ กันเคส login เสร็จแล้ว state ไม่อัปเดต
    const t = window.setInterval(sync, 300);
    return () => window.clearInterval(t);
  }, []);

  function goLogin(returnTo: string) {
    // ✅ เก็บว่าหลัง login อยากไปหน้าไหน
    setReturnTo(returnTo);
    // ✅ เด้งไป backend เพื่อเริ่ม Google OAuth
    window.location.href = `${API_BASE}/auth/google`;
  }
  
  return (
    <header className="w-full fixed top-0 left-0 z-50"
  style={{
    backgroundColor: "rgba(166, 192, 244, 0.9)", 
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    borderBottom: "1px solid rgba(205, 222, 255, 0.9)",
  }}>
      <nav className="max-w-[1440px] mx-auto flex justify-between items-center
       sm:px-16 px-6 py-2">
        <h1 className="flex-1 text-left font-bold text-xl text-white">
          Recommendation Course
        </h1>

    {/* ขวา */}
        <div className="flex items-center gap-3">
          {!isAuthed ? (
            // ❌ ยังไม่ login: กดแล้วไป Google login
            <button
              type="button"
              onClick={() => goLogin("/chat")} // ✅ ถ้าต้องการให้ login เสร็จไปหน้า chat
              className="shrink-0"
            >
              <CustomButton
                title="เริ่มคุยกับ AI"
                btnType="button"
                containerStyles="text-purple-600 font-bold rounded-full bg-white/90 min-w-[150px]"
              />
            </button>
          ) : (
            // ✅ login แล้ว: ปุ่มไปหน้า chat + user icon menu
            <>
              <button
                type="button"
                onClick={() => router.push("/chat")}
                className="shrink-0"
              >
                <CustomButton
                  title="เริ่มคุยกับ AI"
                  btnType="button"
                  containerStyles="text-purple-600 font-bold rounded-full bg-white/90 min-w-[150px]"
                />
              </button>

              {/* ไอคอนผู้ใช้ + dropdown + logout */}
              <UserMenu />
            </>
          )}
        </div>
      </nav>
    </header>
  ) 
}

