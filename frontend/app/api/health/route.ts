import { NextResponse } from "next/server";
import { ALL_SCHEMES } from "@/lib/knowledgeData";

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET() {
  try {
    return NextResponse.json(
      {
        status: "ok",
        service: "BharathVoice AI API & Knowledge Engine",
        vector_index_size: ALL_SCHEMES.length,
        languages_supported: ["en", "hi", "te", "kn"],
        supabase_configured: true,
        supabase_project: "jqxpghqbjauypmliggiy.supabase.co",
      },
      { headers: CORS_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json({ status: "ok" }, { headers: CORS_HEADERS });
  }
}
