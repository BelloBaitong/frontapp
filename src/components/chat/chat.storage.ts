import type { ChatMessage, ChatSession } from "./chat.types";

const SESSIONS_KEY = "chat:sessions";
const MSG_KEY = (sessionId: string) => `chat:messages:${sessionId}`;

function safeJsonParse<T>(v: string | null, fallback: T): T {
  if (!v) return fallback;
  try {
    return JSON.parse(v) as T;
  } catch {
    return fallback;
  }
}

export function lsGetSessions(): ChatSession[] {
  return safeJsonParse<ChatSession[]>(localStorage.getItem(SESSIONS_KEY), []);
}

export function lsSaveSessions(sessions: ChatSession[]) {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function lsGetMessages(sessionId: string): ChatMessage[] {
  return safeJsonParse<ChatMessage[]>(localStorage.getItem(MSG_KEY(sessionId)), []);
}

export function lsSaveMessages(sessionId: string, messages: ChatMessage[]) {
  localStorage.setItem(MSG_KEY(sessionId), JSON.stringify(messages));
}

export function newId(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}
