export type ChatRole = "user" | "assistant";

export type SessionContext = Record<string, any> | null;

export type ChatSource = {
  courseCode: string;
  courseNameTh: string;
  courseNameEn: string;
  description?: string;
  category?: string;
  credits?: number;
  imageUrl?: string;
  distance?: number;
};

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  sources?: ChatSource[] | null;
  createdAt: string; // ISO
};

export type ChatSession = {
  id: string;
  title: string;
  createdAt: string; // ISO
  updatedAt?: string; // ISO
};

export type ChatSendResponse = {
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
  sessionContext?: SessionContext;
};