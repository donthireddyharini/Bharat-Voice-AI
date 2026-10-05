"use client";

import { useEffect, useRef, useState } from "react";
import { v4 as uuidLike } from "@/lib/utils";
import { ChatMessage, AssistantState, Language, SourceRef } from "@/lib/types";
import { sendChat, sendVoiceTranscript } from "@/lib/api";
import { generateKnowledgeResponse } from "@/lib/knowledgeEngine";
import { getLocalizedScheme } from "@/lib/schemeLocalization";
import { startListening, speak, isSpeechRecognitionSupported } from "@/lib/speech";
import { isSupabaseConfigured, storeConversationInSupabase, storeMessageInSupabase } from "@/lib/supabase";
import { saveSearchToHistory } from "@/lib/history";
import MessageBubble from "./MessageBubble";
import ThinkingAnimation from "./ThinkingAnimation";
import VoiceButton from "./VoiceButton";
import AIOrb from "./AIOrb";

const SUGGESTED_QUESTIONS: Record<Language, string[]> = {
  en: [
    "What scholarships are available for students?",
    "Explain this government notification",
    "Tell me about agriculture support",
    "Find employment-related schemes",
  ],
  hi: [
    "छात्रों के लिए कौन-कौन सी छात्रवृत्तियां उपलब्ध हैं?",
    "मुझे इस सरकारी अधिसूचना के बारे में बताएं",
    "कृषि सहायता के बारे में बताएं",
    "रोजगार से जुड़ी योजनाएं खोजें",
  ],
  te: [
    "విద్యార్థులకు ఏమైనా స్కాలర్‌షిప్‌లు ఉన్నాయా?",
    "ఈ ప్రభుత్వ నోటిఫికేషన్‌ను వివరించండి",
    "వ్యవసాయ మద్దతు గురించి చెప్పండి",
    "ఉద్యోగ సంబంధిత పథకాలను కనుగొనండి",
  ],
  kn: [
    "ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಯಾವ ವಿದ್ಯಾರ್ಥಿವೇತನಗಳು ಲಭ್ಯವಿವೆ?",
    "ಈ ಸರ್ಕಾರಿ ಅಧಿಸೂಚನೆಯನ್ನು ವಿವರಿಸಿ",
    "ಕೃಷಿ ಬೆಂಬಲದ ಬಗ್ಗೆ ಹೇಳಿ",
    "ಉದ್ಯೋಗ ಸಂಬಂಧಿತ ಯೋಜನೆಗಳನ್ನು ಹುಡುಕಿ",
  ],
  ta: [
    "மாணவர்களுக்கான கல்வி உதவித்தொகைகள் என்ன?",
    "விவசாய திட்டங்கள் மற்றும் மானியம் பற்றி சொல்லுங்கள்",
    "இந்த அரசு அறிவிப்பை விளக்கமாக கூறுங்கள்",
    "வேலைவாய்ப்பு மற்றும் சிறுதொழில் கடன் திட்டங்கள்",
  ],
  mr: [
    "विद्यार्थ्यांसाठी कोणत्या शिष्यवृत्ती उपलब्ध आहेत?",
    "कृषी सहाय्य आणि शेतकरी योजनांबद्दल सांगा",
    "या सरकारी अधिसूचनेबद्दल सविस्तर माहिती द्या",
    "रोजगार आणि स्वयंरोजगार योजना शोधा",
  ],
  bn: [
    "ছাত্রছাত্রীদের জন্য কী কী স্কলারশিপ রয়েছে?",
    "কৃষকদের জন্য সরকারি সহায়তা প্রকল্প বলুন",
    "এই সরকারি বিজ্ঞপ্তি সম্পর্কে ব্যাখ্যা করুন",
    "কর্মসংস্থান ও ঋণের প্রকল্প খুঁজুন",
  ],
  gu: [
    "વિદ્યાર્થીઓ માટે કઈ સ્કોલરશિપ ઉપલબ્ધ છે?",
    "ખેડૂત સહાય અને કૃષિ યોજનાઓ જણાવો",
    "આ સરકારી નોટિફિકેશન વિશે સમજાવો",
    "રોજગાર અને ધિરાણ યોજનાઓ શોધો",
  ],
  ml: [
    "വിദ്യാർത്ഥികൾക്കുള്ള സ്കോളർഷിപ്പുകൾ ഏതെല്ലാം?",
    "കർഷക സഹായ പദ്ധതികളെക്കുറിച്ച് പറയൂ",
    "ഈ സർക്കാർ വിജ്ഞാപനം വിശദീകരിക്കുക",
    "തൊഴിൽ വായ്പാ പദ്ധതികൾ കണ്ടെത്തുക",
  ],
  pa: [
    "ਵਿਦਿਆਰਥੀਆਂ ਲਈ ਕਿਹੜੇ ਵਜ਼ੀਫ਼ੇ ਉਪਲਬਧ ਹਨ?",
    "ਕਿਸਾਨ ਸਹਾਇਤਾ ਸਕੀਮਾਂ ਬਾਰੇ ਦੱਸੋ",
    "ਇਸ ਸਰਕਾਰੀ ਨੋਟੀਫਿਕੇਸ਼ਨ ਬਾਰੇ ਸਮਝਾਓ",
    "ਰੋਜ਼ਗਾਰ ਅਤੇ ਕਰਜ਼ਾ ਸਕੀਮਾਂ ਲੱਭੋ",
  ],
  or: [
    "ଛାତ୍ରଛାତ୍ରୀଙ୍କ ପାଇଁ କେଉଁ ସ୍କଲାରସିପ୍ ଉପଲବ୍ଧ?",
    "କୃଷକ ସହାୟତା ଯୋଜନା ବିଷୟରେ କୁହନ୍ତୁ",
    "ଏହି ସରକାରୀ ବିଜ୍ଞପ୍ତି ବିଷୟରେ ବୁଝାନ୍ତୁ",
    "ନିଯୁକ୍ତି ଏବଂ ଋଣ ଯୋଜନା ଖୋଜନ୍ତୁ",
  ],
};

const WELCOME_TITLES: Record<Language, { title: string; desc: string }> = {
  en: {
    title: "How Can BharathVoice Assist You?",
    desc: "Tap the microphone 🎙️ below to speak, or type your query in your language. BharathVoice understands your intent and provides step-by-step eligibility, documents, and benefits with live voice responses.",
  },
  te: {
    title: "భారతవాయిస్ మీకు ఎలా సహాయపడగలదు?",
    desc: "మాట్లాడటానికి క్రింది మైక్రోఫోన్ 🎙️ నొక్కండి, లేదా మీ భాషలో ప్రశ్నను టైప్ చేయండి. భారతవాయిస్ మీ అవసరాన్ని అర్థం చేసుకుని అర్హతలు మరియు ప్రయోజనాలను వివరిస్తుంది.",
  },
  hi: {
    title: "भारतवॉयस आपकी किस प्रकार सहायता कर सकता है?",
    desc: "बोलने के लिए नीचे दिए गए माइक्रोफ़ोन 🎙️ पर टैप करें, या अपनी भाषा में टाइप करें। भारतवॉयस आपकी आवश्यकता समझकर सटीक योजना मार्गदर्शन प्रदान करता है।",
  },
  kn: {
    title: "ಭಾರತವಾಯ್ಸ್ ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?",
    desc: "ಮಾತನಾಡಲು ಕೆಳಗಿನ ಮೈಕ್ರೊಫೋನ್ 🎙️ ಅನ್ನು ಟ್ಯಾಪ್ ಮಾಡಿ, ಅಥವಾ ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ. ಅಧಿಕೃತ ಯೋಜನೆಗಳ ಮಾಹಿತಿ ಲಭ್ಯವಿದೆ.",
  },
  ta: {
    title: "பாரத்வாய்ஸ் உங்களுக்கு எவ்வாறு உதவ முடியும்?",
    desc: "பேச கீழே உள்ள மைக்ரோஃபோனை 🎙️ தொடவும், அல்லது உங்கள் மொழியில் தட்டச்சு செய்யவும். நேரலை குரல்வழி பதில்களைப் பெறுங்கள்.",
  },
  mr: {
    title: "भारतव्हॉइस तुम्हाला कशी मदत करू शकतो?",
    desc: "बोलण्यासाठी खालील मायक्रोफोन 🎙️ वर टॅप करा किंवा आपल्या भाषेत टाईप करा. अचूक योजना माहिती मिळवा.",
  },
  bn: {
    title: "ভারতভয়েস আপনাকে কীভাবে সাহায্য করতে পারে?",
    desc: "কথা বলতে নিচের মাইক্রোফোনে 🎙️ আলতো চাপুন, অথবা আপনার ভাষায় টাইপ করুন। সরকারি প্রকল্পের সঠিক তথ্য পান।",
  },
  gu: {
    title: "ભારતવોઇસ તમને કેવી રીતે મદદ કરી શકે?",
    desc: "બોલવા માટે નીચેના માઇક્રોફોન 🎙️ પર ટેપ કરો, અથવા તમારી ભાષામાં ટાઇપ કરો. ત્વરિત સરકારી માર્ગદર્શન મેળવો.",
  },
  ml: {
    title: "ഭാരത്വോയ്സ് നിങ്ങളെ എങ്ങനെ സഹായിക്കും?",
    desc: "സംസാരിക്കാൻ താഴെയുള്ള മൈക്രോഫോൺ 🎙️ ടാപ്പ് ചെയ്യുക, അല്ലെങ്കിൽ നിങ്ങളുടെ ഭാಷയിൽ ടൈപ്പ് ചെയ്യുക. സർക്കാർ ആനുകൂല്യങ്ങൾ അറിയൂ.",
  },
  pa: {
    title: "ਭਾਰਤਵਾਇਸ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹੈ?",
    desc: "ਬੋਲਣ ਲਈ ਹੇਠਾਂ ਦਿੱਤੇ ਮਾਈਕ੍ਰੋਫੋਨ 🎙️ 'ਤੇ ਟੈਪ ਕਰੋ ਜਾਂ ਆਪਣੀ ਭਾਸ਼ਾ ਵਿੱਚ ਟਾਈਪ ਕਰੋ। ਸਰਕਾਰੀ ਸਕੀਮਾਂ ਦੀ ਪੂਰੀ ਜਾਣਕਾਰੀ ਲਵੋ।",
  },
  or: {
    title: "ଭାରତଭଏସ୍ ଆପଣଙ୍କୁ କିପରି ସାହାଯ୍ୟ କରିପାରିବ?",
    desc: "କହିବା ପାଇଁ ତଳେ ଥିବା ମାଇକ୍ରୋଫୋନ୍ 🎙️ ଟ୍ୟାପ୍ କରନ୍ତୁ, କିମ୍ବା ନିଜ ଭାଷାରେ ଟାଇପ୍ କରନ୍ତୁ। ସରକାରୀ ଯୋଜନାର ସଠିକ୍ ମାର୍ଗଦର୍ଶନ ପାଆନ୍ତୁ।",
  },
};

interface ChatWindowProps {
  language: Language;
  externalQuery?: { text: string; nonce: number } | null;
  onSourcesChange?: (sources: SourceRef[]) => void;
  onFollowupsChange?: (followups: string[]) => void;
}

export default function ChatWindow({ language, externalQuery, onSourcesChange, onFollowupsChange }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [assistantState, setAssistantState] = useState<AssistantState>("idle");
  const [isListening, setIsListening] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [errorText, setErrorText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastFailedQuery = useRef<string | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, assistantState]);

  useEffect(() => {
    if (externalQuery && externalQuery.text) {
      sendMessage(externalQuery.text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalQuery?.nonce]);

  async function sendMessage(text: string, viaVoice = false) {
    const query = text.trim();
    if (!query) return;

    setErrorText("");
    const userMessage: ChatMessage = { id: uuidLike(), role: "user", content: query, language };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setAssistantState("understanding");

    try {
      setAssistantState("searching");
      let result;
      try {
        result = viaVoice
          ? await sendVoiceTranscript(query, language, conversationId)
          : await sendChat(query, language, conversationId);
      } catch (networkErr) {
        console.warn("[ChatWindow] Network unavailable, using built-in knowledge engine:", networkErr);
        result = generateKnowledgeResponse(query, language, conversationId);
      }

      // Guarantee valid structured answer
      if (!result || !result.answer) {
        result = generateKnowledgeResponse(query, language, conversationId);
      }

      setAssistantState("generating");
      setConversationId(result.conversation_id);
      const assistantMessage: ChatMessage = {
        id: result.message_id || uuidLike(),
        role: "assistant",
        content: result.answer?.summary || "Here is the verified information.",
        language: result.language || language,
        structured: result.answer,
        sources: result.sources || [],
        followups: result.suggested_followups || [],
      };
      setMessages((prev) => [...prev, assistantMessage]);
      onSourcesChange?.(result.sources || []);
      onFollowupsChange?.(result.suggested_followups || []);

      // Store search query in history with date & details
      saveSearchToHistory({
        query,
        answerSummary: result.answer?.summary || "",
        category: result.answer?.category || (result.sources?.[0]?.title),
        language: result.language || language,
        viaVoice,
        sourcesCount: result.sources?.length || 0,
      });

      // Silently sync conversation and message to Supabase cloud database if connected
      if (isSupabaseConfigured()) {
        try {
          const convId = result.conversation_id || conversationId || `conv-${Date.now()}`;
          storeConversationInSupabase({
            id: convId,
            title: query.slice(0, 60),
            language: result.language || language,
          }).catch(() => {});
          storeMessageInSupabase({
            conversationId: convId,
            role: "user",
            content: query,
            language,
          }).catch(() => {});
          storeMessageInSupabase({
            conversationId: convId,
            role: "assistant",
            content: result.answer?.summary || "",
            language: result.language || language,
            sources: result.sources,
          }).catch(() => {});
        } catch (sbErr) {
          console.warn("[Supabase] Background sync notice:", sbErr);
        }
      }

      setAssistantState("speaking");
      speak(result.answer?.summary || "", result.language || language, () => setAssistantState("idle"));
      lastFailedQuery.current = null;
    } catch (e: any) {
      console.warn("[ChatWindow] Fallback recovery:", e);
      // Emergency zero-failure fallback: always show the grounded answer
      try {
        const fallback = generateKnowledgeResponse(query, language, conversationId);
        const fallbackMessage: ChatMessage = {
          id: uuidLike(),
          role: "assistant",
          content: fallback.answer.summary,
          language: fallback.language,
          structured: fallback.answer,
          sources: fallback.sources,
          followups: fallback.suggested_followups,
        };
        setMessages((prev) => [...prev, fallbackMessage]);
        onSourcesChange?.(fallback.sources);
        onFollowupsChange?.(fallback.suggested_followups);

        saveSearchToHistory({
          query,
          answerSummary: fallback.answer.summary,
          category: fallback.answer.category,
          language: fallback.language || language,
          viaVoice,
          sourcesCount: fallback.sources?.length || 0,
        });
      } catch {}
      setAssistantState("idle");
      lastFailedQuery.current = null;
    }
  }

  function handleVoiceStart() {
    if (!isSpeechRecognitionSupported()) {
      setAssistantState("error");
      setErrorText("Voice input is not supported in this browser. Please try Chrome, or type your question instead.");
      return;
    }
    setIsListening(true);
    setAssistantState("listening");
    startListening(
      language,
      (transcript) => {
        setIsListening(false);
        sendMessage(transcript, true);
      },
      (message) => {
        setIsListening(false);
        setAssistantState("error");
        setErrorText(message);
      },
      () => setIsListening(false)
    );
  }

  function handleVoiceStop() {
    setIsListening(false);
    setAssistantState("idle");
  }

  function handleReadAloud(text: string, msgLanguage?: Language) {
    setAssistantState("speaking");
    speak(text, msgLanguage || language, () => setAssistantState("idle"));
  }

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-1 py-4 space-y-5">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-5 py-6 sm:py-8 max-w-xl mx-auto">
            <AIOrb state={assistantState} size="md" />
            <div className="space-y-1.5 px-3">
              <h2 className="font-display text-lg sm:text-2xl font-bold text-bone">
                {(WELCOME_TITLES[language] || WELCOME_TITLES.en).title}
              </h2>
              <p className="text-xs sm:text-sm text-mist/90 leading-relaxed max-w-md mx-auto">
                {(WELCOME_TITLES[language] || WELCOME_TITLES.en).desc}
              </p>
            </div>
            
            <div className="w-full grid sm:grid-cols-2 gap-2 text-left pt-2">
              {(SUGGESTED_QUESTIONS[language] || SUGGESTED_QUESTIONS.en).map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-left text-xs sm:text-sm glass-strong rounded-xl px-4 py-3 border border-white/10 hover:border-saffron/50 hover:bg-white/10 active:scale-95 transition-all duration-200 group flex items-start justify-between gap-2 shadow-sm"
                >
                  <span className="text-mist group-hover:text-bone transition-colors">{q}</span>
                  <span className="text-xs text-saffron opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={`w-full flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
            <MessageBubble message={m} currentLanguage={language} />
            {m.role === "assistant" && (
              <div className="flex gap-1.5 sm:gap-2 mt-2 flex-wrap pl-1 sm:pl-11 max-w-full">
                <button
                  onClick={() => {
                    const speechText = (m.structured?.scheme_id ? getLocalizedScheme(m.structured.scheme_id, language)?.summary : null) || m.content;
                    handleReadAloud(speechText, language);
                  }}
                  className="text-xs text-mist hover:text-bone hover:bg-white/5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-white/10 hover:border-saffron/30 transition-all duration-200"
                >
                  🔊 Read Aloud
                </button>
                {(m.followups || []).map((f) => (
                  <button
                    key={f}
                    onClick={() => sendMessage(f)}
                    className="text-xs text-mist hover:text-bone hover:bg-white/5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-white/10 hover:border-amethyst/30 transition-all duration-200"
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {(assistantState === "understanding" || assistantState === "searching" || assistantState === "generating") && (
          <ThinkingAnimation state={assistantState} />
        )}

        {assistantState === "error" && errorText && (
          <div className="w-full flex justify-start pl-1 sm:pl-11 my-2">
            <div className="glass-strong rounded-2xl px-4 py-3 border border-red-400/30 text-xs sm:text-sm text-red-200 w-fit max-w-[95%] sm:max-w-[85%] shadow-lg">
              {errorText}
              {lastFailedQuery.current && (
                <button
                  onClick={() => sendMessage(lastFailedQuery.current as string)}
                  className="ml-3 underline text-red-100 font-semibold"
                >
                  Retry
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-white/5 pt-3 sm:pt-4 mt-1 sm:mt-2">
        <div className="flex items-center gap-2 sm:gap-3">
          <VoiceButton isListening={isListening} onStart={handleVoiceStart} onStop={handleVoiceStop} />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            placeholder="Ask in your language…"
            className="flex-1 bg-panel2 border border-white/10 rounded-full px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm outline-none focus:border-saffron/50 placeholder:text-mist/70"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim()}
            className="rounded-full bg-gradient-to-r from-saffron to-gulal px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold disabled:opacity-30 hover:brightness-110 active:scale-95 transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
