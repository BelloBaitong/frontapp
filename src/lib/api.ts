// src/lib/api.ts
import type { Course } from "@/types/course";
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

  const hasBody = rest.body !== undefined && rest.body !== null;
  const isFormData =
    typeof FormData !== "undefined" && rest.body instanceof FormData;

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
    const body =
      typeof data === "object" && data ? (data as ApiErrorBody) : undefined;

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

/** ====== RAG API ====== */
export type RagHistoryItem = {
  role: "user" | "assistant";
  content: string;
};

export type RagRequest = {
  queryText: string;
  topK?: number;
  chatHistory?: RagHistoryItem[] | null;
  sessionContext?: Record<string, any> | null;
};

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

export type RagResponse = {
  answer: string;
  sources: RagSource[];
  sessionContext?: Record<string, any> | null;
};

export function ragAsk(payload: RagRequest) {
  return apiFetch<RagResponse>("/recommendations/rag", {
    method: "POST",
    body: JSON.stringify(payload),
    auth: true,
  });
}

/** ===== Chat API ===== */
export type ChatSessionDto = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt?: string;
};

export type ChatSourceDto = {
  courseCode: string;
  courseNameTh: string;
  courseNameEn: string;
  description?: string;
  category?: string;
  credits?: number;
  imageUrl?: string;
  distance?: number;
};

export type ChatMessageDto = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: ChatSourceDto[] | null;
  createdAt: string;
};

export type ChatSendMessageResponse = {
  userMessage: ChatMessageDto;
  assistantMessage: ChatMessageDto;
  sessionContext?: Record<string, any> | null;
};

export function chatCreateSession(title?: string) {
  return apiFetch<ChatSessionDto>("/chat/sessions", {
    method: "POST",
    body: JSON.stringify({ title }),
    auth: true,
  });
}

export async function chatDeleteSession(sessionId: string) {
  return apiFetch(`/chat/sessions/${sessionId}`, {
    method: "DELETE",
    auth: true,
  });
}

export function chatListSessions() {
  return apiFetch<ChatSessionDto[]>("/chat/sessions", {
    method: "GET",
    auth: true,
  });
}

export function chatListMessages(sessionId: string) {
  return apiFetch<ChatMessageDto[]>(`/chat/sessions/${sessionId}/messages`, {
    method: "GET",
    auth: true,
  });
}

export function chatSendMessage(sessionId: string, content: string, topK = 5) {
  return apiFetch<ChatSendMessageResponse>(
    `/chat/sessions/${sessionId}/messages`,
    {
      method: "POST",
      body: JSON.stringify({ content, topK }),
      auth: true,
    }
  );
}

/** ===== User Profile API ===== */
export type UserProfileCourseDto = {
  id: number;
  courseCode: string;
  courseNameTh?: string | null;
  courseNameEn?: string | null;
};

export type UserProfileDto = {
  id: number;
  userId: number;
  studyYear: number | null;
  interests: string[];
  careerGoals: string[];
  completedCourseIds?: number[];
  courses?: UserProfileCourseDto[];
  createdAt: string;
  updatedAt: string;
};

export type UpsertUserProfilePayload = {
  studyYear?: number;
  interests?: string[];
  careerGoals?: string[];
  completedCourseIds?: number[];
};



export function userProfileGetMe() {
  return apiFetch<UserProfileDto>("/user/profile/me", {
    method: "GET",
    auth: true,
  });
}

export function userProfileUpsertMe(payload: UpsertUserProfilePayload) {
  return apiFetch<UserProfileDto>("/user/profile/me", {
    method: "PUT",
    body: JSON.stringify(payload),
    auth: true,
  });
}

/** ===== Course API ===== */
export function searchCourses(q: string, limit = 8) {
  const params = new URLSearchParams({
    q,
    limit: String(limit),
  });

  return apiFetch<Course[]>(`/course/search?${params.toString()}`, {
    method: "GET",
    auth: false,
  });
}

export function getRecommendedCourses({ limit = 10 }: { limit?: number }) {
  return apiFetch<{ ok: boolean; count: number; courses: any[] }>(
    "/courses/recommend",
    {
      method: "POST",
      body: JSON.stringify({ limit }),
      auth: true,
    }
  );
}