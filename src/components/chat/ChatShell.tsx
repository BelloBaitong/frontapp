'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import type { ChatMessage, ChatSession } from './chat.types';

import {
  chatCreateSession,
  chatListMessages,
  chatListSessions,
  chatSendMessage,
  ApiError,
} from '@/lib/api';

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function newId() {
  return crypto?.randomUUID?.() ?? `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export default function ChatShell() {
  const router = useRouter();

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isBooting, setIsBooting] = useState(true);

  const listRef = useRef<HTMLDivElement | null>(null);

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeId),
    [sessions, activeId],
  );

  // Boot: load sessions -> pick first -> load messages
  useEffect(() => {
    let alive = true;

    (async () => {
      setIsBooting(true);
      try {
        const sess = await chatListSessions();
        if (!alive) return;

        if (sess.length > 0) {
          setSessions(sess as any);
          const firstId = sess[0].id;
          setActiveId(firstId);

          const msgs = await chatListMessages(firstId);
          if (!alive) return;
          setMessages(msgs as any);
        } else {
          const created = await chatCreateSession('วิชาที่เรียนง่าย');
          if (!alive) return;

          setSessions([created] as any);
          setActiveId(created.id);

          const msgs = await chatListMessages(created.id);
          if (!alive) return;
          setMessages(msgs as any);
        }
      } catch (e: any) {
        if (e instanceof ApiError && e.status === 401) {
          router.push('/auth');
          return;
        }
        console.error(e);
      } finally {
        if (alive) setIsBooting(false);
      }
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // when activeId changes -> load messages from DB
  useEffect(() => {
    if (!activeId) return;

    let alive = true;
    (async () => {
      try {
        const msgs = await chatListMessages(activeId);
        if (!alive) return;
        setMessages(msgs as any);
      } catch (e: any) {
        if (e instanceof ApiError && e.status === 401) {
          router.push('/auth');
          return;
        }
        console.error(e);
      }
    })();

    return () => {
      alive = false;
    };
  }, [activeId, router]);

  // autoscroll
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, isSending]);

  const createNewSession = async () => {
    try {
      const created = await chatCreateSession('แชทใหม่');
      setSessions((prev) => [created as any, ...prev]);
      setActiveId(created.id);

      const msgs = await chatListMessages(created.id);
      setMessages(msgs as any);
    } catch (e: any) {
      if (e instanceof ApiError && e.status === 401) {
        router.push('/auth');
        return;
      }
      console.error(e);
    }
  };

  const selectSession = (id: string) => setActiveId(id);

  const send = async () => {
    const text = input.trim();
    if (!text || !activeId || isSending) return;

    setInput('');
    setIsSending(true);

    // optimistic UI
    const optimisticUser: ChatMessage = {
      id: newId(),
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    } as any;
    setMessages((prev) => [...prev, optimisticUser]);

    try {
      const res = await chatSendMessage(activeId, text, 3);

      setMessages((prev) => {
        const trimmed = prev.slice(0, -1);
        return [...trimmed, res.userMessage as any, res.assistantMessage as any];
      });

      const sess = await chatListSessions();
      setSessions(sess as any);
    } catch (e: any) {
      let msg = `ขอโทษนะ ตอนนี้ส่งไม่สำเร็จ (${e?.message ?? 'error'})`;
      if (e instanceof ApiError && e.status === 401) msg = 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่';

      setMessages((prev) => [
        ...prev,
        {
          id: newId(),
          role: 'assistant',
          content: msg,
          createdAt: new Date().toISOString(),
        } as any,
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  };

  const hasRealMessages = !isBooting && messages.length > 0;

  return (
    <div className="w-full">
      {/* Outer card (เหมือนรูป 2) */}
      <div className="w-full max-w-[1200px] mx-auto">
        <div className="rounded-[28px] overflow-hidden shadow-xl ring-1 ring-white/25 bg-white/10 backdrop-blur-md">
          <div className="h-[700px] grid grid-cols-[320px_1fr]">
            {/* LEFT SIDEBAR */}
            <aside className="relative p-6">
              <div className="text-white/90 font-semibold text-2xl">History</div>

              <div className="mt-6 space-y-3">
                {sessions.map((s) => {
                  const isActive = s.id === activeId;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => selectSession(s.id)}
                      className={[
                        'w-full text-left transition',
                        'px-0 py-2',
                        isActive ? 'text-white/95' : 'text-white/70 hover:text-white/90',
                      ].join(' ')}
                    >
                      <div className="font-medium truncate underline underline-offset-4 decoration-white/35">
                        {s.title}
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => void createNewSession()}
                className="mt-6 text-white/80 hover:text-white text-sm underline underline-offset-4 decoration-white/35"
                disabled={isBooting}
              >
                + New
              </button>

              {/* vertical divider */}
              <div className="absolute top-0 right-0 h-full w-px bg-white/30" />
            </aside>

            {/* RIGHT CHAT */}
            <section className="relative">
              {/* top bar (เส้นแนวนอน + home icon) */}
              <div className="h-[86px] flex items-center justify-between px-8">
                <div className="text-white/0 select-none">.</div>
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="w-11 h-11 rounded-2xl bg-white/15 hover:bg-white/25 transition grid place-items-center"
                  title="Home"
                >
                  <span className="text-white text-xl">🏠</span>
                </button>
              </div>
              <div className="h-px bg-white/30" />

              {/* message area */}
              <div className="absolute inset-x-0 top-[87px] bottom-[88px] px-10 py-8">
                <div
                  ref={listRef}
                  className="h-full overflow-auto pr-2"
                >
                  {/* empty state like รูป 2 */}
                  {!hasRealMessages ? (
                    <div className="h-full grid place-items-center text-center">
                      <div className="text-white/80">
                        <div className="text-2xl mb-3">✨</div>
                        <div className="text-xl font-medium">สนใจเรียนวิชาแบบไหน?</div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((m) => {
                        const isUser = m.role === 'user';
                        return (
                          <div
                            key={m.id}
                            className={[
                              'max-w-[70%] rounded-3xl px-5 py-3 whitespace-pre-wrap',
                              isUser
                                ? 'ml-auto bg-white/90 text-black'
                                : 'mr-auto bg-white/70 text-black',
                            ].join(' ')}
                          >
                            <div className="text-sm">{m.content}</div>
                            <div className="text-[11px] opacity-60 mt-1">{formatTime(m.createdAt)}</div>
                          </div>
                        );
                      })}

                      {isSending && (
                        <div className="mr-auto max-w-[70%] rounded-3xl px-5 py-3 bg-white/50 text-black">
                          <div className="text-sm opacity-80">AI กำลังตอบ...</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* input bar inside card */}
              <div className="absolute inset-x-0 bottom-0 h-[88px] px-10 flex items-center">
                <div className="w-full bg-white/70 rounded-2xl px-4 py-3 flex items-center gap-4">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder="ASK..."
                    className="flex-1 bg-transparent outline-none text-black placeholder:text-black/40"
                    disabled={isBooting || !activeId}
                  />
                  <button
                    type="button"
                    onClick={() => void send()}
                    disabled={isSending || isBooting || !input.trim() || !activeId}
                    className="w-11 h-11 rounded-xl bg-white/70 hover:bg-white disabled:opacity-60 grid place-items-center"
                    title="Send"
                  >
                    <span className="text-black/70 text-xl">➤</span>
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
