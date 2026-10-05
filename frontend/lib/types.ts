export type Language =
  | "en"
  | "hi"
  | "te"
  | "kn"
  | "ta"
  | "mr"
  | "bn"
  | "gu"
  | "ml"
  | "pa"
  | "or";

export interface SourceRef {
  title: string;
  category: string;
  source: string;
  last_updated: string;
  doc_id: string;
  url?: string;
  verified?: boolean;
}

export interface StructuredAnswer {
  scheme_id?: string;
  scheme_name?: string;
  summary: string;
  eligibility: string[];
  benefits: string[];
  documents_required: string[];
  application_steps: string[];
  clarifying_question?: string;
  grounded: boolean;
}

export interface ChatResponse {
  conversation_id: string;
  message_id: string;
  answer: StructuredAnswer;
  sources: SourceRef[];
  language: Language;
  suggested_followups: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  language: Language;
  structured?: StructuredAnswer;
  sources?: SourceRef[];
  followups?: string[];
}

export type AssistantState =
  | "idle"
  | "listening"
  | "understanding"
  | "searching"
  | "generating"
  | "speaking"
  | "error";

export interface CategoryItem {
  key: string;
  label: string;
  icon: string;
  description: string;
  doc_count: number;
}
