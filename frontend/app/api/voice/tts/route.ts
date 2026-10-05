import { NextRequest, NextResponse } from "next/server";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { Language } from "@/lib/types";

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Studio-grade Human Neural Voice models for Indian languages
const NEURAL_VOICE_MAP: Partial<Record<Language, string>> = {
  te: "te-IN-ShrutiNeural",           // Authentic, 100% human-natural fluent Telugu
  hi: "hi-IN-SwaraNeural",            // Authentic, 100% human-natural fluent Hindi
  kn: "kn-IN-SapnaNeural",            // Authentic, 100% human-natural fluent Kannada
  ta: "ta-IN-PallaviNeural",          // Authentic, 100% human-natural fluent Tamil
  ml: "ml-IN-SobhanaNeural",          // Authentic, 100% human-natural fluent Malayalam
  mr: "mr-IN-AarohiNeural",           // Authentic, 100% human-natural fluent Marathi
  bn: "bn-IN-TanishaaNeural",         // Authentic, 100% human-natural fluent Bengali
  gu: "gu-IN-DhwaniNeural",           // Authentic, 100% human-natural fluent Gujarati
  en: "en-IN-NeerjaExpressiveNeural", // Authentic, 100% human-natural Indian English
};

// Fallback Google TTS locale codes
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
  or: null,
};

// In-memory cache for ultra-fast instant audio delivery of common voice phrases
const AUDIO_CACHE = new Map<string, Buffer>();
const MAX_CACHE_SIZE = 100;

function cleanTextForSpeech(text: string, language: Language = "en"): string {
  let cleaned = text
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[*_#`~>\[\]\(\)\{\}|\\^]/g, " ")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[•\-\–—]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Clean currency and measurement symbols for human natural pronunciation
  if (language === "te") {
    cleaned = cleaned
      .replace(/[₹\u20B9]\s*/g, "రూపాయలు ")
      .replace(/రూ\.\s*/g, "రూపాయలు ")
      .replace(/రూ\s+/g, "రూపాయలు ")
      .replace(/%/g, " శాతం ")
      .replace(/km\s*/gi, " కిలోమీటర్లు ")
      .replace(/AI\b/g, "ఏఐ");
  } else if (language === "hi") {
    cleaned = cleaned
      .replace(/[₹\u20B9]\s*/g, "रुपये ")
      .replace(/रु\.\s*/g, "रुपये ")
      .replace(/रु\s+/g, "रुपये ")
      .replace(/%/g, " प्रतिशत ")
      .replace(/km\s*/gi, " किलोमीटर ")
      .replace(/AI\b/g, "एआई");
  } else if (language === "kn") {
    cleaned = cleaned
      .replace(/[₹\u20B9]\s*/g, "ರೂಪಾಯಿ ")
      .replace(/ರೂ\.\s*/g, "ರೂಪಾಯಿ ")
      .replace(/%/g, " ప్రతిశత ");
  } else if (language === "ta") {
    cleaned = cleaned
      .replace(/[₹\u20B9]\s*/g, "ரூபாய் ")
      .replace(/ரூ\.\s*/g, "ரூபாய் ")
      .replace(/%/g, " சதவீதம் ");
  } else if (language === "mr") {
    cleaned = cleaned
      .replace(/[₹\u20B9]\s*/g, "रुपये ")
      .replace(/रु\.\s*/g, "रुपये ");
  } else if (language === "bn") {
    cleaned = cleaned.replace(/[₹\u20B9]\s*/g, "টাকা ");
  } else if (language === "gu") {
    cleaned = cleaned.replace(/[₹\u20B9]\s*/g, "રૂપિયા ");
  } else if (language === "ml") {
    cleaned = cleaned.replace(/[₹\u20B9]\s*/g, "രൂപ ");
  } else {
    cleaned = cleaned
      .replace(/[₹\u20B9]\s*/g, "Rupees ")
      .replace(/Rs\.\s*/gi, "Rupees ")
      .replace(/Govt\.\s*/gi, "Government ");
  }

  // Pick first 2-3 sentences for natural, concise vocal delivery (max 380 chars)
  const sentences = cleaned.split(/(?<=[.!?।])\s+/).filter(Boolean);
  if (sentences.length > 2 && cleaned.length > 320) {
    cleaned = sentences.slice(0, 2).join(" ");
  }
  if (cleaned.length > 380) {
    const sub = cleaned.slice(0, 380);
    const lastPunct = Math.max(sub.lastIndexOf("."), sub.lastIndexOf("!"), sub.lastIndexOf("?"), sub.lastIndexOf("।"));
    if (lastPunct > 150) {
      cleaned = sub.slice(0, lastPunct + 1);
    } else {
      cleaned = sub.trim();
    }
  }

  return cleaned.trim();
}

/**
 * Generate human-like studio speech via Microsoft Azure/Edge Neural TTS
 */
async function generateNeuralTTS(text: string, voiceName: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const tts = new MsEdgeTTS();
      const timeout = setTimeout(() => {
        reject(new Error("Neural TTS timeout"));
      }, 4500);

      tts
        .setMetadata(voiceName, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3)
        .then(() => {
          try {
            const stream = tts.toStream(text, { rate: 0, pitch: "+0Hz" });
            const chunks: Buffer[] = [];

            stream.audioStream.on("data", (chunk: Buffer) => {
              chunks.push(chunk);
            });

            stream.audioStream.on("end", () => {
              clearTimeout(timeout);
              resolve(Buffer.concat(chunks));
            });

            stream.audioStream.on("error", (err: any) => {
              clearTimeout(timeout);
              reject(err);
            });
          } catch (streamErr) {
            clearTimeout(timeout);
            reject(streamErr);
          }
        })
        .catch((metaErr) => {
          clearTimeout(timeout);
          reject(metaErr);
        });
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Secondary fallback to Google TTS
 */
async function generateGoogleTTS(text: string, ttsLang: string): Promise<Buffer | null> {
  try {
    const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
      text
    )}&tl=${encodeURIComponent(ttsLang)}&client=tw-ob`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(googleTtsUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Referer: "https://translate.google.com/",
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const arrayBuf = await res.arrayBuffer();
      return Buffer.from(arrayBuf);
    }
  } catch (err) {
    console.warn("[TTS] Google TTS fallback notice:", err);
  }
  return null;
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

    // Check cache
    const cacheKey = `${language}:${cleaned}`;
    if (AUDIO_CACHE.has(cacheKey)) {
      const cached = AUDIO_CACHE.get(cacheKey)!;
      return new NextResponse(cached, {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "audio/mpeg",
          "Content-Length": cached.length.toString(),
          "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        },
      });
    }

    // 1. Primary: Studio-grade Human-Natural Neural TTS (Microsoft Azure Neural)
    const neuralVoice = NEURAL_VOICE_MAP[language];
    if (neuralVoice) {
      try {
        const audioBuffer = await generateNeuralTTS(cleaned, neuralVoice);
        if (audioBuffer && audioBuffer.length > 500) {
          if (AUDIO_CACHE.size >= MAX_CACHE_SIZE) {
            const firstKey = AUDIO_CACHE.keys().next().value;
            if (firstKey) AUDIO_CACHE.delete(firstKey);
          }
          AUDIO_CACHE.set(cacheKey, audioBuffer);

          return new NextResponse(audioBuffer, {
            status: 200,
            headers: {
              ...CORS_HEADERS,
              "Content-Type": "audio/mpeg",
              "Content-Length": audioBuffer.length.toString(),
              "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
            },
          });
        }
      } catch (neuralErr) {
        console.warn(`[TTS] Neural synthesis failed for ${language}, falling back to Google TTS:`, neuralErr);
      }
    }

    // 2. Fallback: Google TTS
    const googleLang = GOOGLE_TTS_LANG_MAP[language] || "en-IN";
    const googleAudio = await generateGoogleTTS(cleaned, googleLang);
    if (googleAudio && googleAudio.length > 500) {
      return new NextResponse(googleAudio, {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "audio/mpeg",
          "Content-Length": googleAudio.length.toString(),
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    return NextResponse.json({ detail: "Use client speech synthesis" }, { status: 404, headers: CORS_HEADERS });
  } catch (err: any) {
    console.error("[TTS] Handler error:", err);
    return NextResponse.json({ detail: "TTS generation error" }, { status: 500, headers: CORS_HEADERS });
  }
}
