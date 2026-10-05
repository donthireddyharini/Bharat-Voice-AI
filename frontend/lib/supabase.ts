"use client";

import { createClient, SupabaseClient } from "@supabase/supabase-js";

const STORAGE_URL_KEY = "bharathvoice_supabase_url";
const STORAGE_KEY_KEY = "bharathvoice_supabase_anon_key";

const DEFAULT_SUPABASE_URL = "https://jqxpghqbjauypmliggiy.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxeHBnaHFiamF1eXBtbGlnZ2l5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEwODkyODgsImV4cCI6MjEwNjY2NTI4OH0.2OMwE2Zak7II-pm0Uvs2rn4pGl6218jCSzi_tIOhJJ0";

// Default or environment values
const ENV_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const ENV_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

let cachedClient: SupabaseClient | null = null;

function normalizeSupabaseUrl(raw: string): string {
  if (!raw) return "";
  let u = raw.trim();
  // Strip trailing /rest/v1 or trailing slashes
  u = u.replace(/\/rest\/v1\/?$/i, "").replace(/\/+$/, "");
  return u;
}

export function getSupabaseCredentials(): { url: string; anonKey: string } {
  if (typeof window === "undefined") {
    return { url: normalizeSupabaseUrl(ENV_SUPABASE_URL), anonKey: ENV_SUPABASE_ANON_KEY };
  }

  const storedUrl = localStorage.getItem(STORAGE_URL_KEY);
  const storedKey = localStorage.getItem(STORAGE_KEY_KEY);

  const rawUrl = storedUrl || ENV_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const anonKey = storedKey || ENV_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  return { url: normalizeSupabaseUrl(rawUrl), anonKey: anonKey.trim() };
}

export function saveSupabaseCredentials(url: string, anonKey: string) {
  if (typeof window === "undefined") return;
  const normalized = normalizeSupabaseUrl(url);
  localStorage.setItem(STORAGE_URL_KEY, normalized);
  localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim());
  cachedClient = null; // reset client cache
  window.dispatchEvent(new Event("supabase-config-changed"));
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseCredentials();
  return Boolean(url && anonKey && url.includes("supabase.co") && anonKey.length > 20);
}

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseCredentials();
  if (!url || !anonKey) return null;

  try {
    if (!cachedClient) {
      cachedClient = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    }
    return cachedClient;
  } catch (err) {
    console.error("Failed to initialize Supabase client:", err);
    return null;
  }
}

/**
 * Tests live connection to Supabase instance.
 */
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: "Supabase URL and Anon Key are required. Please provide credentials.",
    };
  }

  try {
    // Attempt lightweight ping / auth status check
    const { error } = await client.auth.getSession();
    if (error) {
      return { success: false, message: error.message };
    }
    return { success: true, message: "Successfully connected to Supabase cloud database!" };
  } catch (err: any) {
    return { success: false, message: err?.message || "Could not reach Supabase endpoint." };
  }
}

/**
 * Stores or updates a citizen profile in Supabase.
 */
export async function storeProfileInSupabase(profile: {
  userId?: string | null;
  name?: string;
  email?: string;
  language?: string;
  state?: string;
  education?: string;
  occupation?: string;
  interests?: string[];
}): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: "Supabase not configured" };

  try {
    const { error } = await client.from("citizen_profiles").upsert(
      {
        user_id: profile.userId || "anonymous",
        name: profile.name,
        email: profile.email,
        preferred_language: profile.language || "te",
        state: profile.state,
        education_level: profile.education,
        occupation: profile.occupation,
        interests: profile.interests || [],
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.warn("Supabase profile save notice:", err?.message || err);
    return { success: false, error: err?.message };
  }
}

/**
 * Stores a conversation session in Supabase.
 */
export async function storeConversationInSupabase(conversation: {
  id: string;
  userId?: string | null;
  title: string;
  language?: string;
  messageCount?: number;
}): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: "Supabase not configured" };

  try {
    const { error } = await client.from("citizen_conversations").upsert({
      id: conversation.id,
      user_id: conversation.userId || "anonymous",
      title: conversation.title,
      language: conversation.language || "en",
      message_count: conversation.messageCount || 1,
      updated_at: new Date().toISOString(),
    });

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.warn("Supabase conversation save notice:", err?.message || err);
    return { success: false, error: err?.message };
  }
}

/**
 * Stores a chat message in Supabase.
 */
export async function storeMessageInSupabase(msg: {
  id?: string;
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  language?: string;
  sources?: any[];
}): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: "Supabase not configured" };

  try {
    const { error } = await client.from("citizen_messages").insert({
      conversation_id: msg.conversationId,
      role: msg.role,
      content: msg.content,
      language: msg.language || "en",
      sources: msg.sources || [],
      created_at: new Date().toISOString(),
    });

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.warn("Supabase message save notice:", err?.message || err);
    return { success: false, error: err?.message };
  }
}
