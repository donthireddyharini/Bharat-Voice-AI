import { ChatMessage, Language, SourceRef } from "./types";
import { formatSearchDate } from "./history";

export interface ChatSession {
  id: string;
  title: string;
  firstQuery: string;
  lastMessageSnippet: string;
  language: Language;
  createdAt: number;
  updatedAt: number;
  formattedDate: string;
  messages: ChatMessage[];
  sources?: SourceRef[];
  followups?: string[];
}

const SESSIONS_STORAGE_KEY = "bharathvoice_chat_sessions";
export const CHAT_SESSIONS_UPDATED_EVENT = "bharathvoice_chat_sessions_updated";

export function getChatSessions(): ChatSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Failed to read chat sessions:", e);
    return [];
  }
}

export function getChatSessionById(id: string): ChatSession | null {
  const sessions = getChatSessions();
  return sessions.find((s) => s.id === id) || null;
}

export function saveOrUpdateChatSession(session: {
  id: string;
  messages: ChatMessage[];
  language: Language;
  sources?: SourceRef[];
  followups?: string[];
  title?: string;
}): ChatSession {
  const now = new Date();
  const existingSessions = getChatSessions();
  const existing = existingSessions.find((s) => s.id === session.id);

  const firstUserMsg = session.messages.find((m) => m.role === "user");
  const lastAssistantMsg = [...session.messages].reverse().find((m) => m.role === "assistant");

  const title =
    session.title ||
    existing?.title ||
    (firstUserMsg ? firstUserMsg.content.slice(0, 50) : "Government Scheme Inquiry");

  const updatedSession: ChatSession = {
    id: session.id,
    title,
    firstQuery: firstUserMsg ? firstUserMsg.content : existing?.firstQuery || "",
    lastMessageSnippet: lastAssistantMsg ? lastAssistantMsg.content.slice(0, 100) : "",
    language: session.language || existing?.language || "en",
    createdAt: existing?.createdAt || now.getTime(),
    updatedAt: now.getTime(),
    formattedDate: formatSearchDate(now),
    messages: session.messages,
    sources: session.sources || existing?.sources || [],
    followups: session.followups || existing?.followups || [],
  };

  if (typeof window !== "undefined") {
    try {
      const filtered = existingSessions.filter((s) => s.id !== session.id);
      const updatedList = [updatedSession, ...filtered].slice(0, 50); // Store up to 50 complete chats
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updatedList));
      window.dispatchEvent(new CustomEvent(CHAT_SESSIONS_UPDATED_EVENT, { detail: updatedSession }));
    } catch (e) {
      console.error("Failed to save chat session:", e);
    }
  }

  return updatedSession;
}

export function deleteChatSession(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getChatSessions();
    const updated = existing.filter((s) => s.id !== id);
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(CHAT_SESSIONS_UPDATED_EVENT));
  } catch (e) {
    console.error("Failed to delete chat session:", e);
  }
}

export function clearAllChatSessions(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(SESSIONS_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(CHAT_SESSIONS_UPDATED_EVENT));
  } catch (e) {
    console.error("Failed to clear chat sessions:", e);
  }
}
