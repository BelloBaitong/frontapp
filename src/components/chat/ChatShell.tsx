'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import type {
  ChatMessage,
  ChatSession,
  SessionContext,
} from './chat.types';

import {
  chatCreateSession,
  chatDeleteSession,
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
  const [deletingId, setDeletingId] = useState<string>('');
  const [sessionContextById, setSessionContextById] = useState<Record<string, SessionContext>>({});

  const listRef = useRef<HTMLDivElement | null>(null);

  const loadMessages = async (sessionId: string) => {
    const msgs = await chatListMessages(sessionId);
    setMessages(msgs);
  };
  
  const activeSessionContext = activeId ? sessionContextById[activeId] : null;


  useEffect(() => {
    let alive = true;

    (async () => {
      setIsBooting(true);
      try {
        const sess = await chatListSessions();
        if (!alive) return;

        if (sess.length > 0) {
          setSessions(sess);
          setActiveId(sess[0].id);
          const msgs = await chatListMessages(sess[0].id);
          if (!alive) return;
          setMessages(msgs);
        } else {
          const created = await chatCreateSession('แชทใหม่');
          if (!alive) return;

          setSessions([created]);
          setActiveId(created.id);
          setMessages([]);
        }
      } catch (e: unknown) {
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
  }, [router]);

  useEffect(() => {
    if (!activeId) return;

    let alive = true;
    (async () => {
      try {
        const msgs = await chatListMessages(activeId);
        if (!alive) return;
        setMessages(msgs);
      } catch (e: unknown) {
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

  useEffect(() => {
  if (process.env.NODE_ENV === 'development' && activeSessionContext) {
    console.log(
      '%c sessionContext active',
      'color: green; font-weight: bold;',
      activeSessionContext
    );
  }
}, [activeSessionContext]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, isSending]);

  const createNewSession = async () => {
    try {
      const created = await chatCreateSession('แชทใหม่');
      setSessions((prev) => [created, ...prev]);
      setActiveId(created.id);
      setMessages([]);
      setSessionContextById((prev) => ({
        ...prev,
        [created.id]: null,
      }));
    } catch (e: unknown) {
      if (e instanceof ApiError && e.status === 401) {
        router.push('/auth');
        return;
      }
      console.error(e);
    }
  };

  const selectSession = (id: string) => {
    if (id === activeId) return;
    setActiveId(id);
  };

  const deleteSession = async (sessionId: string) => {
    if (!sessionId || deletingId) return;

    const session = sessions.find((s) => s.id === sessionId);
    const ok = window.confirm(`ต้องการลบแชท "${session?.title ?? 'แชทนี้'}" ใช่ไหม`);
    if (!ok) return;

    setDeletingId(sessionId);

    try {
      await chatDeleteSession(sessionId);

      const remaining = sessions.filter((s) => s.id !== sessionId);
      setSessions(remaining);

      setSessionContextById((prev) => {
        const next = { ...prev };
        delete next[sessionId];
        return next;
      });

      if (remaining.length === 0) {
        const created = await chatCreateSession('แชทใหม่');
        setSessions([created]);
        setActiveId(created.id);
        setMessages([]);
        setSessionContextById({ [created.id]: null });
        return;
      }

      if (activeId === sessionId) {
        const nextId = remaining[0].id;
        setActiveId(nextId);
        const nextMessages = await chatListMessages(nextId);
        setMessages(nextMessages);
      }
    } catch (e: unknown) {
      if (e instanceof ApiError && e.status === 401) {
        router.push('/auth');
        return;
      }
      console.error(e);
      alert('ลบแชทไม่สำเร็จ');
    } finally {
      setDeletingId('');
    }
  };

  const send = async () => {
    const text = input.trim();
    if (!text || !activeId || isSending) return;

    setInput('');
    setIsSending(true);

    const optimisticUser: ChatMessage = {
      id: newId(),
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
      sources: null,
    };

    setMessages((prev) => [...prev, optimisticUser]);

    try {
      const res = await chatSendMessage(activeId, text, 15);

      setMessages((prev) => {
        const trimmed = prev.slice(0, -1);
        return [...trimmed, res.userMessage, res.assistantMessage];
      });

      if (Object.prototype.hasOwnProperty.call(res, 'sessionContext')) {
        setSessionContextById((prev) => ({
          ...prev,
          [activeId]: res.sessionContext ?? null,
        }));
      }

      const sess = await chatListSessions();
      setSessions(sess);
    } catch (e: unknown) {
      let msg = `ขอโทษนะ ตอนนี้ส่งไม่สำเร็จ (${e instanceof Error ? e.message : 'error'})`;
      if (e instanceof ApiError && e.status === 401) {
        msg = 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่';
      }

      setMessages((prev) => [
        ...prev,
        {
          id: newId(),
          role: 'assistant',
          content: msg,
          createdAt: new Date().toISOString(),
          sources: null,
        },
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
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="overflow-hidden rounded-[28px] bg-white/10 shadow-xl ring-1 ring-white/25 backdrop-blur-md">
          <div className="grid h-[calc(100vh-48px)] min-h-[560px] max-h-[700px] grid-cols-[320px_minmax(0,1fr)]">
            <aside className="relative flex h-full min-h-0 flex-col p-6">
              <div className="shrink-0 text-2xl font-semibold text-white/90">History</div>

              <div className="mt-6 flex-1 min-h-0 overflow-y-auto pr-2 space-y-2">
                {sessions.map((s) => {
                  const isActive = s.id === activeId;
                  const isDeleting = deletingId === s.id;

                  return (
                    <div
                      key={s.id}
                      className={[
                        'group flex items-center gap-2 rounded-xl px-2 py-1 transition',
                        isActive ? 'bg-white/10' : 'hover:bg-white/5',
                      ].join(' ')}
                    >
                      <button
                        type="button"
                        onClick={() => selectSession(s.id)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <div
                          className={[
                            'truncate font-medium underline underline-offset-4 decoration-white/35 transition',
                            isActive ? 'text-white/95' : 'text-white/70 hover:text-white/90',
                          ].join(' ')}
                          title={s.title}
                        >
                          {s.title}
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => void deleteSession(s.id)}
                        disabled={isDeleting || isBooting}
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white/55 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
                        title="ลบแชท"
                      >
                        {isDeleting ? '…' : '✕'}
                      </button>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => void createNewSession()}
                className="mt-4 shrink-0 text-left text-sm text-white/80 underline underline-offset-4 decoration-white/35 hover:text-white"
                disabled={isBooting}
              >
                + New
              </button>

              <div className="absolute top-0 right-0 h-full w-px bg-white/30" />
            </aside>

            <section className="flex h-full min-h-0 flex-col">
              <div className="flex h-[86px] shrink-0 items-center justify-end px-8">
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="grid h-11 w-11 place-items-center rounded-2xl bg-white/15 transition hover:bg-white/25"
                  title="Home"
                >
                  <span className="text-xl text-white">🏠</span>
                </button>
              </div>

              <div className="h-px shrink-0 bg-white/30" />

              <div className="flex-1 min-h-0 px-10 py-8">
                <div ref={listRef} className="h-full overflow-y-auto pr-2">
                  {!hasRealMessages ? (
                    <div className="grid h-full place-items-center text-center">
                      <div className="text-white/80">
                        <div className="mb-3 text-2xl">✨</div>
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
                              'max-w-[70%] whitespace-pre-wrap rounded-3xl px-5 py-3',
                              isUser
                                ? 'ml-auto bg-white/90 text-black'
                                : 'mr-auto bg-white/70 text-black',
                            ].join(' ')}
                          >
                            <div className="text-sm">{m.content}</div>
                            <div className="mt-1 text-[11px] opacity-60">
                              {formatTime(m.createdAt)}
                            </div>
                          </div>
                        );
                      })}

                      {isSending && (
                        <div className="mr-auto max-w-[70%] rounded-3xl bg-white/50 px-5 py-3 text-black">
                          <div className="text-sm opacity-80">AI กำลังตอบ...</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="shrink-0 px-10 pb-6 pt-3">
                <div className="flex items-center gap-4 rounded-2xl bg-white/70 px-4 py-3">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder="ASK..."
                    className="flex-1 bg-transparent text-black outline-none placeholder:text-black/40"
                    disabled={isBooting || !activeId}
                  />
                  <button
                    type="button"
                    onClick={() => void send()}
                    disabled={isSending || isBooting || !input.trim() || !activeId}
                    className="grid h-11 w-11 place-items-center rounded-xl bg-white/70 hover:bg-white disabled:opacity-60"
                    title="Send"
                  >
                    <span className="text-xl text-black/70">➤</span>
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