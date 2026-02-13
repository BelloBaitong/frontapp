// src/lib/api.ts
import { getToken } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

type ApiErrorBody = {
  message?: string | string[];
  error?: string;
  statusCode?: number;
};

export class ApiError extends Error {
  status: number;
  body?: ApiErrorBody;

  constructor(status: number, message: string, body?: ApiErrorBody) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

async function parseJsonSafe(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const { auth = true, headers, ...rest } = options;

  const h = new Headers(headers);

  // ถ้าส่ง body เป็น object ให้ใส่ content-type + stringify ให้
  const hasBody = rest.body !== undefined && rest.body !== null;
  const isFormData = typeof FormData !== "undefined" && rest.body instanceof FormData;

  if (hasBody && !isFormData && !h.has("Content-Type")) {
    h.set("Content-Type", "application/json");
  }

  if (auth) {
    const token = getToken();
    if (token) h.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: h,
  });

  const data = await parseJsonSafe(res);

  if (!res.ok) {
    const body = (typeof data === "object" && data) ? (data as ApiErrorBody) : undefined;

    const msg =
      (body?.message
        ? Array.isArray(body.message)
          ? body.message.join(", ")
          : body.message
        : typeof data === "string"
          ? data
          : null) ?? `Request failed (${res.status})`;

    throw new ApiError(res.status, msg, body);
  }

  return data as T;
}

/** ====== API functions (เริ่มจาก RAG ก่อน) ====== */
export type RagRequest = { queryText: string; topK?: number };
export type RagSource = {
  courseCode: string;
  courseNameTh: string;
  courseNameEn: string;
  description: string;
  category: string;
  credits: number;
  imageUrl?: string;
  distance?: number;
};
export type RagResponse = { answer: string; sources: RagSource[] };

export function ragAsk(payload: RagRequest) {
  return apiFetch<RagResponse>("/recommendations/rag", {
    method: "POST",
    body: JSON.stringify(payload),
    auth: true, // endpoint นี้คุณใส่ JWT guard แล้ว
  });
}

// ===== Chat API =====
export type ChatSessionDto = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt?: string;
};

export type ChatMessageDto = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: any;
  createdAt: string;
};

// สร้างห้องใหม่
export function chatCreateSession(title?: string) {
  return apiFetch<ChatSessionDto>("/chat/sessions", {
    method: "POST",
    body: JSON.stringify({ title }),
    auth: true,
  });
}

// list ห้องทั้งหมด
export function chatListSessions() {
  return apiFetch<ChatSessionDto[]>("/chat/sessions", {
    method: "GET",
    auth: true,
  });
}

// list messages ของห้อง
export function chatListMessages(sessionId: string) {
  return apiFetch<ChatMessageDto[]>(`/chat/sessions/${sessionId}/messages`, {
    method: "GET",
    auth: true,
  });
}

// ส่งข้อความ (backend จะ save + call rag + save แล้วคืน userMessage/assistantMessage)
export function chatSendMessage(sessionId: string, content: string, topK = 3) {
  return apiFetch<{
    userMessage: ChatMessageDto;
    assistantMessage: ChatMessageDto;
  }>(`/chat/sessions/${sessionId}/messages`, {
    method: "POST",
    body: JSON.stringify({ content, topK }),
    auth: true,
  });
}
