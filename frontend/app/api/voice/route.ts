import { NextRequest, NextResponse } from "next/server";
import { generateKnowledgeResponse } from "@/lib/knowledgeEngine";
import { Language } from "@/lib/types";

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { transcript, language = "en", conversation_id, user_id } = body;

    const raw = transcript || body.query || "";
    const trimmedText = typeof raw === "string" ? raw.trim() : "";
    if (!trimmedText) {
      return NextResponse.json(
        { detail: "Transcript cannot be empty" },
        { status: 422, headers: CORS_HEADERS }
      );
    }

    const lang = (language as Language) || "en";

    // 1. If an external Python backend is explicitly set, attempt to proxy
    const backendUrl = process.env.BACKEND_URL;
    if (backendUrl && !backendUrl.includes("localhost")) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        const res = await fetch(`${backendUrl}/api/voice`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcript: trimmedText, language: lang, conversation_id, user_id }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          return NextResponse.json(data, { headers: CORS_HEADERS });
        }
      } catch {
        // Fall back gracefully to built-in knowledge engine
      }
    }

    // 2. Built-in Next.js Grounded RAG Knowledge Engine
    const result = generateKnowledgeResponse(trimmedText, lang, conversation_id);

    return NextResponse.json(result, { headers: CORS_HEADERS });
  } catch (err: any) {
    const fallbackResult = generateKnowledgeResponse("government schemes", "en");
    return NextResponse.json(fallbackResult, { headers: CORS_HEADERS });
  }
}
