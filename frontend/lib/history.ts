export interface SearchHistoryEntry {
  id: string;
  query: string;
  answerSummary?: string;
  category?: string;
  language: string;
  timestamp: number;
  formattedDate: string;
  viaVoice?: boolean;
  sourcesCount?: number;
}

const STORAGE_KEY = "bharathvoice_search_history";
export const HISTORY_UPDATED_EVENT = "bharathvoice_history_updated";

export function formatSearchDate(date: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  } catch {
    return date.toLocaleString();
  }
}

export function getSearchHistory(): SearchHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Failed to parse search history:", e);
    return [];
  }
}

export function saveSearchToHistory(item: {
  query: string;
  answerSummary?: string;
  category?: string;
  language?: string;
  viaVoice?: boolean;
  sourcesCount?: number;
}): SearchHistoryEntry {
  const now = new Date();
  const entry: SearchHistoryEntry = {
    id: `search-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    query: item.query.trim(),
    answerSummary: item.answerSummary?.trim(),
    category: item.category,
    language: item.language || "en",
    timestamp: now.getTime(),
    formattedDate: formatSearchDate(now),
    viaVoice: !!item.viaVoice,
    sourcesCount: item.sourcesCount ?? 0,
  };

  if (typeof window !== "undefined") {
    try {
      const existing = getSearchHistory();
      // Remove duplicate consecutive searches or older exact duplicates to keep history clean
      const filtered = existing.filter(
        (prev) => prev.query.toLowerCase() !== entry.query.toLowerCase() || (entry.timestamp - prev.timestamp) > 30000
      );
      // Keep up to 100 recent searches
      const updated = [entry, ...filtered].slice(0, 100);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent(HISTORY_UPDATED_EVENT, { detail: entry }));
    } catch (e) {
      console.error("Failed to save search history:", e);
    }
  }

  return entry;
}

export function deleteSearchHistoryItem(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getSearchHistory();
    const updated = existing.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(HISTORY_UPDATED_EVENT));
  } catch (e) {
    console.error("Failed to delete search history item:", e);
  }
}

export function clearSearchHistory(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(HISTORY_UPDATED_EVENT));
  } catch (e) {
    console.error("Failed to clear search history:", e);
  }
}
