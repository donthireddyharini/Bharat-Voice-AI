"use client";

import { Language } from "./types";

// BCP-47 locale codes used by the Web Speech recognition API.
export const SPEECH_LOCALES: Record<Language, string> = {
  en: "en-IN",
  hi: "hi-IN",
  te: "te-IN",
  kn: "kn-IN",
  ta: "ta-IN",
  mr: "mr-IN",
  bn: "bn-IN",
  gu: "gu-IN",
  ml: "ml-IN",
  pa: "pa-IN",
  or: "or-IN",
};

let currentAudio: HTMLAudioElement | null = null;

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
}

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/**
 * Plays the signature Google Assistant chime using the Web Audio API.
 * type 'start': high ascending two-tone beep when listening begins
 * type 'end': descending confirmation tone when listening concludes
 */
export function playAssistantChime(type: "start" | "end" = "start") {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    if (type === "start") {
      // Iconic Google Assistant double-tone ping
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(523.25, now); // C5
      gain1.gain.setValueAtTime(0.08, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.09);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(880, now + 0.09); // A5
      gain2.gain.setValueAtTime(0.1, now + 0.09);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.09);
      osc2.stop(now + 0.23);
    } else {
      // Soft Google Assistant completion chime
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(783.99, now); // G5
      osc.frequency.exponentialRampToValueAtTime(523.25, now + 0.14); // C5
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.17);
    }
  } catch (err) {
    // Autoplay policy or unsupported audio context
  }
}

/**
 * Cleans markdown and formatting artifacts before synthesis.
 */
function cleanTextForSpeech(text: string, language: Language): string {
  let cleaned = text
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[*_#`~>]/g, "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[•\-\–\[\]\(\)\{\}]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

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
      .replace(/AI\b/g, "एआई");
  } else if (language === "kn") {
    cleaned = cleaned.replace(/[₹\u20B9]\s*/g, "ರೂಪಾಯಿ ").replace(/రూ\.\s*/g, "ರೂಪಾಯಿ ").replace(/%/g, " ಪ್ರತಿಶತ ");
  } else if (language === "ta") {
    cleaned = cleaned.replace(/[₹\u20B9]\s*/g, "ரூபாய் ").replace(/ரூ\.\s*/g, "ரூபாய் ").replace(/%/g, " சதவீதம் ");
  } else if (language === "bn") {
    cleaned = cleaned.replace(/[₹\u20B9]\s*/g, "টাকা ").replace(/টাকা\s*/g, "টাকা ");
  } else if (language === "gu") {
    cleaned = cleaned.replace(/[₹\u20B9]\s*/g, "રૂપિયા ").replace(/રૂ\.\s*/g, "રૂપિયા ");
  } else if (language === "ml") {
    cleaned = cleaned.replace(/[₹\u20B9]\s*/g, "രൂപ ").replace(/രൂ\.\s*/g, "രൂപ ");
  } else if (language === "pa") {
    cleaned = cleaned.replace(/[₹\u20B9]\s*/g, "ਰੁਪਏ ").replace(/ਰੁ\.\s*/g, "ਰੁਪਏ ");
  } else if (language === "or") {
    cleaned = cleaned.replace(/[₹\u20B9]\s*/g, "ଟଙ୍କା ").replace(/ଟ\.\s*/g, "ଟଙ୍କା ");
  } else {
    cleaned = cleaned.replace(/[₹\u20B9]\s*/g, "Rupees ").replace(/Rs\.\s*/gi, "Rupees ").replace(/Rs\s+/gi, "Rupees ");
  }

  // Speak the ENTIRE answer completely without cutting off sentences (up to 1600 characters)
  if (cleaned.length > 1600) {
    const sub = cleaned.slice(0, 1600);
    const lastPunct = Math.max(sub.lastIndexOf("."), sub.lastIndexOf("!"), sub.lastIndexOf("?"), sub.lastIndexOf("।"));
    if (lastPunct > 600) {
      cleaned = sub.slice(0, lastPunct + 1);
    } else {
      cleaned = sub.trim();
    }
  }

  return cleaned.trim();
}

let cachedVoices: SpeechSynthesisVoice[] = [];

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  cachedVoices = window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
}

/**
 * Scores a browser voice for quality and human naturalness.
 */
function scoreVoice(v: SpeechSynthesisVoice, language: Language): number {
  const name = v.name.toLowerCase();
  const lang = v.lang.toLowerCase().replace("_", "-");
  const targetLocale = (SPEECH_LOCALES[language] || "en-IN").toLowerCase().replace("_", "-");
  const langPrefix = language.toLowerCase();

  const isExactLocale = lang === targetLocale;
  const isPrefixLocale = lang.startsWith(langPrefix);
  const isEnglishFallback = language === "en" && lang.startsWith("en");

  if (!isPrefixLocale && !isEnglishFallback && !isExactLocale) {
    // Check if the voice name explicitly names the Indian language
    const langNames: Record<Language, string[]> = {
      en: ["english", "india", "neerja", "prabhat"],
      hi: ["hindi", "हिन्दी", "swara", "madhur", "kalpana"],
      te: ["telugu", "తెలుగు", "mohan", "shruti"],
      kn: ["kannada", "ಕನ್ನಡ", "gagan", "sapna"],
      ta: ["tamil", "தமிழ்", "valluvar", "iniya"],
      mr: ["marathi", "मराठी", "aarohi", "manohar"],
      bn: ["bengali", "বাংলা", "bangla", "bashkar", "tanishaa"],
      gu: ["gujarati", "ગુજરાતી", "dhwani", "niranjan"],
      ml: ["malayalam", "മലയാളം", "midhun", "sobha"],
      pa: ["punjabi", "ਪੰਜਾਬੀ", "gurmukhi", "harman"],
      or: ["odia", "ଓଡ଼ିଆ", "oriya"],
    };
    const hasNameMatch = (langNames[language] || []).some((n) => name.includes(n));
    if (!hasNameMatch) return -1;
  }

  let score = 0;
  if (isExactLocale) score += 100;
  else if (isPrefixLocale) score += 60;

  // Prioritize premium, human-like neural voices
  if (name.includes("natural") || name.includes("online")) score += 180;
  if (name.includes("neural") || name.includes("hd")) score += 170;
  if (name.includes("google")) score += 150;
  if (name.includes("microsoft")) score += 130;
  if (name.includes("siri") || name.includes("apple")) score += 110;

  // Preferred fluent regional voice models
  if (language === "te" && (name.includes("shruti") || name.includes("mohan") || name.includes("telugu"))) score += 60;
  if (language === "hi" && (name.includes("swara") || name.includes("madhur") || name.includes("hindi"))) score += 60;
  if (language === "kn" && (name.includes("sapna") || name.includes("gagan") || name.includes("kannada"))) score += 60;
  if (language === "ta" && (name.includes("pallavi") || name.includes("valluvar") || name.includes("tamil"))) score += 60;
  if (language === "mr" && (name.includes("aarohi") || name.includes("manohar") || name.includes("marathi"))) score += 60;
  if (language === "bn" && (name.includes("tanishaa") || name.includes("bashkar") || name.includes("bengali"))) score += 60;
  if (language === "gu" && (name.includes("dhwani") || name.includes("niranjan") || name.includes("gujarati"))) score += 60;
  if (language === "ml" && (name.includes("sobhana") || name.includes("midhun") || name.includes("malayalam"))) score += 60;
  if (language === "pa" && (name.includes("harman") || name.includes("punjabi"))) score += 60;
  if (language === "or" && (name.includes("odia") || name.includes("oriya"))) score += 60;
  if (language === "en" && (name.includes("neerja") || name.includes("prabhat") || name.includes("india"))) score += 60;

  return score;
}

export function getMatchingVoice(language: Language): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  let bestVoice: SpeechSynthesisVoice | null = null;
  let bestScore = -1;

  for (const v of voices) {
    const s = scoreVoice(v, language);
    if (s > bestScore) {
      bestScore = s;
      bestVoice = v;
    }
  }

  return bestVoice;
}

/**
 * Starts browser-native speech recognition (Web Speech API).
 */
export function startListening(
  language: Language,
  onResult: (transcript: string) => void,
  onError: (message: string) => void,
  onEnd?: () => void
) {
  const SpeechRecognitionCtor =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognitionCtor) {
    onError("Voice input is not supported in this browser. Please try Google Chrome or Microsoft Edge.");
    return null;
  }

  const recognition = new SpeechRecognitionCtor();
  recognition.lang = SPEECH_LOCALES[language] || "en-IN";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.continuous = false;

  recognition.onresult = (event: any) => {
    if (event.results && event.results[0] && event.results[0][0]) {
      const transcript = event.results[0][0].transcript;
      if (transcript && transcript.trim()) {
        playAssistantChime("end");
        onResult(transcript.trim());
      }
    }
  };

  recognition.onerror = (event: any) => {
    if (event.error === "no-speech") {
      onEnd?.();
      return;
    }
    if (event.error === "not-allowed" || event.error === "service-not-allowed") {
      onError("Microphone permission was denied. Please allow microphone access in your browser address bar.");
      return;
    }
    if (event.error === "network") {
      onError("Voice network error. Please check your internet connection.");
      return;
    }
    onError(`Voice input notice: ${event.error}. Please try again or type.`);
  };

  recognition.onend = () => {
    onEnd?.();
  };

  try {
    playAssistantChime("start");
    recognition.start();
  } catch (err: any) {
    onError("Could not start microphone. Please ensure permissions are granted.");
    return null;
  }

  return recognition;
}

/**
 * Speaks text aloud using high-definition Neural TTS from backend (/api/voice/tts).
 * Delivers authentic, 100% human-natural regional accents for Telugu, Hindi, Kannada, Tamil, etc.
 * Falls back seamlessly to browser SpeechSynthesis if offline.
 */
export async function speak(text: string, language: Language, onEnd?: () => void) {
  if (!text || !text.trim()) {
    onEnd?.();
    return;
  }

  stopSpeaking();
  const cleanedText = cleanTextForSpeech(text, language);

  let ended = false;
  const finish = () => {
    if (!ended) {
      ended = true;
      currentAudio = null;
      onEnd?.();
    }
  };

  // 1. Primary: Studio-grade Human-Natural Neural TTS (/api/voice/tts)
  if (typeof window !== "undefined") {
    try {
      const audioUrl = `/api/voice/tts?text=${encodeURIComponent(cleanedText)}&language=${encodeURIComponent(language)}`;
      const audio = new Audio();
      currentAudio = audio;
      audio.preload = "auto";
      audio.src = audioUrl;

      let fallbackTriggered = false;
      const triggerFallback = () => {
        if (!fallbackTriggered && !ended) {
          fallbackTriggered = true;
          if (currentAudio === audio) currentAudio = null;
          try {
            audio.pause();
          } catch {}
          fallbackBrowserSpeak(cleanedText, language, finish);
        }
      };

      audio.onended = finish;
      audio.onerror = () => {
        triggerFallback();
      };

      // If audio fails to load within 3.5 seconds, fall back immediately so user never waits
      const loadTimeout = setTimeout(() => {
        if (!ended && audio.readyState < 2) {
          triggerFallback();
        }
      }, 3500);

      audio.onplaying = () => {
        clearTimeout(loadTimeout);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        await playPromise;
      }
      return;
    } catch (err) {
      console.warn("[TTS] Neural stream notice, using browser fallback:", err);
      if (!ended) {
        fallbackBrowserSpeak(cleanedText, language, finish);
      }
      return;
    }
  }

  // 2. Fallback: Browser native SpeechSynthesis
  fallbackBrowserSpeak(cleanedText, language, finish);
}

function fallbackBrowserSpeak(cleanedText: string, language: Language, onEnd?: () => void) {
  if (!isSpeechSynthesisSupported()) {
    onEnd?.();
    return;
  }

  let ended = false;
  const finish = () => {
    if (!ended) {
      ended = true;
      onEnd?.();
    }
  };

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.lang = SPEECH_LOCALES[language] || "en-IN";
    utterance.volume = 1.0;

    if (language === "te") {
      utterance.rate = 1.08;
      utterance.pitch = 1.0;
    } else if (language === "hi" || language === "mr") {
      utterance.rate = 1.08;
      utterance.pitch = 1.0;
    } else if (language === "kn") {
      utterance.rate = 1.08;
      utterance.pitch = 1.0;
    } else if (language === "ta") {
      utterance.rate = 1.08;
      utterance.pitch = 1.0;
    } else if (language === "bn") {
      utterance.rate = 1.08;
      utterance.pitch = 1.0;
    } else if (language === "gu") {
      utterance.rate = 1.08;
      utterance.pitch = 1.0;
    } else if (language === "ml") {
      utterance.rate = 1.06;
      utterance.pitch = 1.0;
    } else if (language === "pa") {
      utterance.rate = 1.08;
      utterance.pitch = 1.0;
    } else if (language === "or") {
      utterance.rate = 1.08;
      utterance.pitch = 1.0;
    } else {
      utterance.rate = 1.08;
      utterance.pitch = 1.02;
    }

    const voice = getMatchingVoice(language);
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onend = finish;
    utterance.onerror = finish;

    // Safety timeout in case speech engine hangs or drops event
    const estimatedDuration = Math.max(4000, Math.min(25000, cleanedText.length * 90));
    setTimeout(finish, estimatedDuration);

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    finish();
  }
}

export function stopSpeaking() {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch {}
    currentAudio = null;
  }
  if (isSpeechSynthesisSupported()) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
}
