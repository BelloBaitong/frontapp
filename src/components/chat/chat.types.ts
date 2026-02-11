export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string; // ISO
};

export type ChatSession = {
  id: string;
  title: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
};
