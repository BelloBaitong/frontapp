"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import type { ChatMessage, ChatSession } from "./chat.types";
import { lsGetMessages, lsGetSessions, lsSaveMessages, lsSaveSessions, newId } from "./chat.storage";

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function buildTitleFromFirstUserMsg(text: string) {
  const t = text.trim();
  if (!t) return "แชทใหม่";
  return t.length > 22 ? t.slice(0, 22) + "…" : t;
}

export default function ChatShell() {
  const router = useRouter();

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");

  const listRef = useRef<HTMLDivElement | null>(null);

  // init
  useEffect(() => {
    const ss = lsGetSessions();
    setSessions(ss);

    // ถ้ายังไม่มี session -> สร้างอัตโนมัติ
    if (ss.length === 0) {
      const now = new Date().toISOString();
      const s: ChatSession = {
        id: newId("session"),
        title: "วิชาที่เรียนง่าย",
        createdAt: now,
        updatedAt: now,
      };
      const next = [s];
      setSessions(next);
      lsSaveSessions(next);
      setActiveId(s.id);
      setMessages([]);
      lsSaveMessages(s.id, []);
      return;
    }

    // เลือก session ล่าสุด
    const sorted = [...ss].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    const pick = sorted[0];
    setActiveId(pick.id);
    setMessages(lsGetMessages(pick.id));
  }, []);

  // โหลด messages เมื่อเปลี่ยน active
  useEffect(() => {
    if (!activeId) return;
    setMessages(lsGetMessages(activeId));
  }, [activeId]);

  // auto scroll
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const activeSession = useMemo(() => sessions.find((s) => s.id === activeId) ?? null, [sessions, activeId]);

  function createNewSession() {
    const now = new Date().toISOString();
    const s: ChatSession = {
      id: newId("session"),
      title: "แชทใหม่",
      createdAt: now,
      updatedAt: now,
    };
    const next = [s, ...sessions];
    setSessions(next);
    lsSaveSessions(next);

    setActiveId(s.id);
    setMessages([]);
    lsSaveMessages(s.id, []);
  }

  function selectSession(id: string) {
    setActiveId(id);
  }

  function updateSessionTitleAndTime(sessionId: string, maybeTitle?: string) {
    const now = new Date().toISOString();
    const next = sessions.map((s) =>
      s.id === sessionId
        ? {
            ...s,
            title: maybeTitle ?? s.title,
            updatedAt: now,
          }
        : s
    );
    setSessions(next);
    lsSaveSessions(next);
  }

  function onSend() {
    const text = input.trim();
    if (!text || !activeId) return;

    const now = new Date().toISOString();

    const userMsg: ChatMessage = {
      id: newId("m"),
      role: "user",
      content: text,
      createdAt: now,
    };

    const nextMsgs = [...messages, userMsg];
    setMessages(nextMsgs);
    lsSaveMessages(activeId, nextMsgs);

    // ตั้งชื่อห้องจากข้อความแรก (ถ้าห้องยังเป็น "แชทใหม่")
    if (activeSession?.title === "แชทใหม่") {
      updateSessionTitleAndTime(activeId, buildTitleFromFirstUserMsg(text));
    } else {
      updateSessionTitleAndTime(activeId);
    }

    setInput("");

    // ====== MOCK AI RESPONSE (ไว้แทน backend) ======
    // ภายหลังจะเปลี่ยนเป็นเรียก POST /chat/sessions/:id/messages
    window.setTimeout(() => {
      const bot: ChatMessage = {
        id: newId("m"),
        role: "assistant",
        content: "ตอนนี้เป็นโหมดเตรียมหน้าแชทนะ 😊 เดี๋ยวพอหลังบ้านพร้อม เราจะให้ AI ตอบจริงจาก API ได้เลย",
        createdAt: new Date().toISOString(),
      };
      const after = [...lsGetMessages(activeId), bot];
      setMessages(after);
      lsSaveMessages(activeId, after);
      updateSessionTitleAndTime(activeId);
    }, 350);
  }

  return (
    <main className="min-h-screen pt-24 px-4 sm:px-6 pb-10">
      <section className="mx-auto max-w-6xl">
        {/* shell */}
        <div className="rounded-3xl overflow-hidden border border-white/40 shadow-xl bg-white/30 backdrop-blur-md">
          {/* top bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/40">

            <button
              type="button"
              onClick={() => router.push("/")}
              className="h-9 w-9 rounded-xl bg-white/30 border border-white/40 hover:bg-white/45 transition flex items-center justify-center"
              aria-label="Home"
              title="Home"
            >
              <span className="text-xl">🏠</span>
            </button>
          </div>

          {/* content */}
          <div className="grid grid-cols-12 min-h-[560px]">
            {/* left sidebar */}
            <aside className="col-span-12 sm:col-span-4 lg:col-span-3 border-r border-white/40 bg-white/15">
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-white font-bold text-lg drop-shadow">History</h2>
                  <button
                    type="button"
                    onClick={createNewSession}
                    className="rounded-xl bg-white/25 border border-white/40 px-3 py-1.5 text-white text-sm font-semibold hover:bg-white/35 transition"
                  >
                    + New
                  </button>
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  {sessions
                    .slice()
                    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
                    .map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => selectSession(s.id)}
                        className={[
                          "text-left w-full rounded-2xl px-4 py-3 border transition",
                          s.id === activeId
                            ? "bg-white/40 border-white/60 shadow"
                            : "bg-white/15 border-white/30 hover:bg-white/25",
                        ].join(" ")}
                      >
                        <p className="text-white font-semibold truncate">{s.title}</p>
                        <p className="text-white/70 text-xs mt-1">{formatTime(s.updatedAt)}</p>
                      </button>
                    ))}
                </div>
              </div>
            </aside>

            {/* right chat */}
            <section className="col-span-12 sm:col-span-8 lg:col-span-9 relative">
              {/* message list */}
              <div ref={listRef} className="h-[520px] overflow-auto px-6 py-6">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center text-white/80">
                      <div className="text-2xl mb-2">✨</div>
                      <p className="drop-shadow">สนใจเรียนวิชาแบบไหน?</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {messages.map((m) => (
                      <div
                        key={m.id}
                        className={[
                          "max-w-[80%] rounded-2xl px-4 py-3 border shadow-sm",
                          m.role === "user"
                            ? "ml-auto bg-white/85 border-white/70"
                            : "mr-auto bg-white/55 border-white/50",
                        ].join(" ")}
                      >
                        <p className="text-sm text-gray-800 whitespace-pre-line">{m.content}</p>
                        <p className="text-[11px] text-gray-500 mt-2">{formatTime(m.createdAt)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* input */}
              <div className="absolute left-0 right-0 bottom-0 p-6 bg-gradient-to-t from-white/35 to-transparent">
                <div className="flex items-center gap-3 rounded-2xl bg-white/85 border border-white/70 shadow px-4 py-3">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") onSend();
                    }}
                    placeholder="ASK..."
                    className="flex-1 bg-transparent outline-none text-gray-800 placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={onSend}
                    className="h-10 w-10 rounded-xl bg-black/5 hover:bg-black/10 transition flex items-center justify-center"
                    aria-label="Send"
                  >
                    <span className="text-xl">➤</span>
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
