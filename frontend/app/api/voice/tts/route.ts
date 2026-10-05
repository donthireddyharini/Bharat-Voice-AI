import { NextRequest, NextResponse } from "next/server";
import { Language } from "@/lib/types";

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const GOOGLE_TTS_LANG_MAP: Record<Language, string | null> = {
  en: "en-IN",
  hi: "hi",
  te: "te",
  kn: "kn",
  ta: "ta",
  mr: "mr",
  bn: "bn",
  gu: "gu",
  ml: "ml",
  pa: "pa",
  or: null, // Odia handled by browser SpeechSynthesis
};

function cleanTextForSpeech(text: string, language: Language = "en"): string {
  let cleaned = text
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[*_#`~>\[\]\(\)\{\}]/g, " ")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[•\-\–]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (language === "te") {
    cleaned = cleaned.replace(/[₹\u20B9]\s*/g, "రూపాయలు ").replace(/రూ\.\s*/g, "రూపాయలు ");
  } else if (language === "hi" || language === "mr") {
    cleaned = cleaned.replace(/[₹\u20B9]\s*/g, "रुपये ").replace(/रु\.\s*/g, "रुपये ");
  } else if (language === "kn") {
    cleaned = cleaned.replace(/[₹\u20B9]\s*/g, "ರೂಪಾಯಿ ");
  } else if (language === "ta") {
    cleaned = cleaned.replace(/[₹\u20B9]\s*/g, "ரூபாய் ");
  } else {
    cleaned = cleaned.replace(/[₹\u20B9]\s*/g, "Rupees ").replace(/Rs\.\s*/gi, "Rupees ");
  }

  // Pick first 1-2 sentences for instant natural vocal delivery
  const sentences = cleaned.split(/(?<=[.!?।])\s+/);
  if (sentences.length > 2 && cleaned.length > 200) {
    cleaned = sentences.slice(0, 2).join(" ");
  }
  // Hard cap to prevent URL truncation in upstream TTS
  if (cleaned.length > 220) {
    cleaned = cleaned.slice(0, 217) + "...";
  }

  return cleaned;
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const text = searchParams.get("text") || "";
    const language = (searchParams.get("language") as Language) || "en";

    const cleaned = cleanTextForSpeech(text, language);
    if (!cleaned) {
      return NextResponse.json({ detail: "Empty text" }, { status: 400, headers: CORS_HEADERS });
    }

    const ttsLang = GOOGLE_TTS_LANG_MAP[language];
    if (!ttsLang) {
      // Return 404 to let client fallback seamlessly to browser neural voice
      return NextResponse.json({ detail: "Use client speech synthesis" }, { status: 404, headers: CORS_HEADERS });
    }

    const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
      cleaned
    )}&tl=${encodeURIComponent(ttsLang)}&client=tw-ob`;

    const upstreamRes = await fetch(googleTtsUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: "https://translate.google.com/",
      },
    });

    if (!upstreamRes.ok) {
      return NextResponse.json(
        { detail: "Upstream synthesis unavailable" },
        { status: upstreamRes.status, headers: CORS_HEADERS }
      );
    }

    const audioBuffer = await upstreamRes.arrayBuffer();

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { detail: "TTS synthesis failed", error: String(err?.message || err) },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
