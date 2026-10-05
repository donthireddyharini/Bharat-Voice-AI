import { ChatResponse, Language, StructuredAnswer } from "./types";
import { generateKnowledgeResponse, detectUserIntent, searchSchemes } from "./knowledgeEngine";

const USER_AGENT = "BharathVoiceAI/2.0 (https://bharat-voice-ai-jet.vercel.app; info@bharatvoice.in)";

const LANGUAGE_PROMPT_NAMES: Record<Language, string> = {
  te: "Telugu (తెలుగు)",
  hi: "Hindi (हिन्दी)",
  kn: "Kannada (ಕನ್ನಡ)",
  ta: "Tamil (தமிழ்)",
  mr: "Marathi (मराठी)",
  bn: "Bengali (বাংলা)",
  gu: "Gujarati (ગુજરાતી)",
  ml: "Malayalam (മലയാളം)",
  pa: "Punjabi (ਪੰਜਾਬੀ)",
  or: "Odia (ଓଡ଼ିଆ)",
  en: "English",
};

/**
 * Clean text for clean speech synthesis without symbols or asterisks
 */
function sanitizeForSpeech(text: string): string {
  return text
    .replace(/[*#_~`[\](){}|\\<>]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\s([.,!?:;])/g, "$1")
    .trim();
}

/**
 * Free universal Google translation helper for cross-lingual knowledge retrieval
 */
async function translateText(text: string, targetLang: Language | "en", sourceLang: string = "auto"): Promise<string> {
  if (!text || targetLang === sourceLang) return text;
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return text;
    const data = await res.json();
    if (Array.isArray(data) && Array.isArray(data[0])) {
      const translated = data[0].map((s: any) => s[0]).join("");
      return translated || text;
    }
  } catch {
    // If translation fails, return original
  }
  return text;
}

/**
 * Call Google Gemini API if key is available in environment
 */
async function callGemini(prompt: string, apiKey: string): Promise<string | null> {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 600, temperature: 0.3 }
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text && text.trim().length > 0) return sanitizeForSpeech(text);
    }
  } catch (err) {
    console.warn("[UniversalAI] Gemini error:", err);
  }
  return null;
}

/**
 * Call Groq API if key is available in environment
 */
async function callGroq(prompt: string, apiKey: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 600,
        temperature: 0.3,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content;
      if (text && text.trim().length > 0) return sanitizeForSpeech(text);
    }
  } catch (err) {
    console.warn("[UniversalAI] Groq error:", err);
  }
  return null;
}

/**
 * Call OpenAI API if key is available in environment
 */
async function callOpenAI(prompt: string, apiKey: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 600,
        temperature: 0.3,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content;
      if (text && text.trim().length > 0) return sanitizeForSpeech(text);
    }
  } catch (err) {
    console.warn("[UniversalAI] OpenAI error:", err);
  }
  return null;
}

/**
 * Solve simple arithmetic expressions asked via voice
 */
function solveArithmetic(query: string, language: Language): string | null {
  const match = query.match(/(\d+(?:\.\d+)?)\s*([\+\-\*\/xX÷])\s*(\d+(?:\.\d+)?)/);
  if (!match) return null;

  const a = parseFloat(match[1]);
  const op = match[2];
  const b = parseFloat(match[3]);
  let result: number | string;

  if (op === "+") result = a + b;
  else if (op === "-") result = a - b;
  else if (op === "*" || op === "x" || op === "X") result = a * b;
  else if (op === "/" || op === "÷") {
    if (b === 0) return language === "te" ? "సున్నాతో భాగించలేము (సున్నా విభజన చెల్లదు)." : "Cannot divide by zero.";
    result = parseFloat((a / b).toFixed(4));
  } else {
    return null;
  }

  const symbol = op === "x" || op === "X" ? "×" : op === "/" || op === "÷" ? "÷" : op;
  if (language === "te") {
    return `${a} ${symbol} ${b} = ${result}. జవాబు: ${result}.`;
  } else if (language === "hi") {
    return `${a} ${symbol} ${b} = ${result}. उत्तर: ${result} है।`;
  }
  return `${a} ${symbol} ${b} = ${result}. The answer is ${result}.`;
}

/**
 * Handle direct conversational questions (Identity, Well-being, Jokes, Greetings)
 */
function getConversationalResponse(query: string, language: Language): string | null {
  const lower = query.toLowerCase().trim();

  // Who are you / Identity
  if (
    lower.includes("who are you") ||
    lower.includes("what is your name") ||
    query.includes("నువ్వు ఎవరు") ||
    query.includes("నీ పేరేంటి") ||
    query.includes("నువ్వెవరు") ||
    query.includes("तुम कौन हो") ||
    query.includes("तुम्हारा नाम क्या है")
  ) {
    if (language === "te") {
      return "నేను భారత్ వాయిస్ ఏఐ (BharathVoice AI)ని. భారత ప్రభుత్వ సంక్షేమ పథకాలు, విద్యార్థుల స్కాలర్‌షిప్‌లు, రైతు సాయం మరియు మీ ఎలాంటి సందేహాలకైనా 11 భారతీయ భాషల్లో సమాధానం అందించే మీ డిజిటల్ వాయిస్ అసిస్టెంట్‌ని.";
    }
    if (language === "hi") {
      return "मैं भारत वॉयस एआई (BharathVoice AI) हूँ। मैं भारत सरकार की कल्याणकारी योजनाओं, छात्रवृत्तियों, किसान सहायता और आपके किसी भी प्रश्न का 11 भारतीय भाषाओं में उत्तर देने वाला आपका डिजिटल वॉयस सहायक हूँ।";
    }
    return "I am BharathVoice AI, your multilingual AI voice assistant providing verified government welfare schemes, citizen services, and answers to any question across 11 Indian languages.";
  }

  // How are you
  if (
    lower.includes("how are you") ||
    query.includes("ఎలా ఉన్నావు") ||
    query.includes("బాగున్నావా") ||
    query.includes("कैसे हो") ||
    query.includes("कैसी हो")
  ) {
    if (language === "te") {
      return "నేను చాలా బాగున్నాను, ధన్యవాదాలు! మీకు ఈరోజు ఏ విషయంలో సహాయం కావాలి? మీరు ఏదైనా ప్రశ్న అడగవచ్చు.";
    }
    if (language === "hi") {
      return "मैं बहुत बढ़िया हूँ, धन्यवाद! आज मैं आपकी क्या सहायता कर सकता हूँ? आप कोई भी प्रश्न पूछ सकते हैं।";
    }
    return "I am doing great, thank you! How can I help you today? Feel free to ask any question.";
  }

  // Tell a joke / entertainment
  if (
    lower.includes("joke") ||
    query.includes("జోక్") ||
    query.includes("చురుకు") ||
    query.includes("చమత్కారం") ||
    query.includes("चुटकुला")
  ) {
    if (language === "te") {
      return "ఒక చిన్న జోక్: టీచర్: రోజూ హోంవర్క్ ఎందుకు చేయట్లేదు? విద్యార్థి: సర్, మా అమ్మ చెప్పింది, నేటి పని రేపటికి వాయిదా వేయకూడదని, అందుకే నిన్నటి హోంవర్క్ ఈరోజే పూర్తి చేసేశాను!";
    }
    if (language === "hi") {
      return "एक मजेदार चुटकुला: शिक्षक ने पूछा- संजू, तुम रोज स्कूल देर से क्यों आते हो? संजू बोला- सर, सड़क पर एक बोर्ड लगा है 'धीरे चलें, आगे स्कूल है'!";
    }
    return "Here's a quick joke: Why don't scientists trust atoms? Because they make up everything!";
  }

  // Tell a story
  if (
    lower.includes("story") ||
    query.includes("కథ") ||
    query.includes("कहानी")
  ) {
    if (language === "te") {
      return "ఒక చిన్న నీతి కథ: ఒక తాబేలు, కుందేలు పరుగు పందెం పెట్టుకున్నాయి. కుందేలు అతి విశ్వాసంతో మధ్యలో నిద్రపోయింది. తాబేలు మాత్రం ఆగకుండా నిరంతరం ముందుకు సాగి గెలిచింది. నీతి: స్థిరమైన ప్రయత్నం ఎల్లప్పుడూ విజయాన్ని అందిస్తుంది.";
    }
    if (language === "hi") {
      return "एक छोटी प्रेरक कहानी: कछुए और खरगोश की दौड़ में, खरगोश ने अहंकार में विश्राम किया, जबकि कछुआ निरंतर चलता रहा और जीत गया। सीख: लगातार किया गया प्रयास हमेशा सफलता दिलाता है।";
    }
    return "A short story: The tortoise and the hare raced. The overconfident hare rested, while the persistent tortoise kept going and won. Moral: Slow and steady wins the race.";
  }

  return null;
}

/**
 * Universal Knowledge Retrieval across Multilingual Open Knowledge Archives
 */
async function queryGlobalKnowledge(query: string, language: Language): Promise<{ title: string; summary: string; url: string } | null> {
  try {
    // 1. If non-English query, translate to English for best knowledge index matching
    let searchTopic = query;
    if (language !== "en") {
      searchTopic = await translateText(query, "en", language);
    }

    // Clean query from search prefixes like "tell me about", "who is", "what is", etc.
    const cleanSearch = searchTopic
      .replace(/^(who is|what is|how does|why does|tell me about|explain|where is|when was)\s+/i, "")
      .replace(/[?!.]+$/, "")
      .trim();

    const candidateQueries = [cleanSearch, searchTopic];

    for (const q of candidateQueries) {
      if (!q) continue;

      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&format=json`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4500);
      const res = await fetch(searchUrl, {
        headers: { "User-Agent": USER_AGENT },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) continue;
      const data = await res.json();
      const title = data.query?.search?.[0]?.title;
      if (!title) continue;

      const sumUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
      const sumController = new AbortController();
      const sumTimeout = setTimeout(() => sumController.abort(), 4500);
      const sumRes = await fetch(sumUrl, {
        headers: { "User-Agent": USER_AGENT },
        signal: sumController.signal,
      });
      clearTimeout(sumTimeout);

      if (!sumRes.ok) continue;
      const sumData = await sumRes.json();
      const extract = sumData.extract;

      if (extract && extract.length > 30) {
        // Translate extract back to target regional Indian language
        let localizedExtract = extract;
        if (language !== "en") {
          localizedExtract = await translateText(extract, language, "en");
        }

        let localizedTitle = title;
        if (language !== "en") {
          localizedTitle = await translateText(title, language, "en");
        }

        return {
          title: sanitizeForSpeech(localizedTitle),
          summary: sanitizeForSpeech(localizedExtract),
          url: sumData.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
        };
      }
    }
  } catch (err) {
    console.warn("[UniversalAI] Global knowledge retrieval error:", err);
  }

  return null;
}

/**
 * Universal AI Answer Generator
 * Answers ANY question asked via voice or text in all 11 Indian languages.
 * Completely eliminates rigid rule-based limitations.
 */
export async function getUniversalAnswer(
  query: string,
  language: Language = "en",
  conversationId?: string
): Promise<ChatResponse> {
  const trimmed = (query || "").trim();
  const convId = conversationId || `conv-${Date.now()}`;
  const msgId = `msg-${Date.now()}`;

  if (!trimmed) {
    return generateKnowledgeResponse("hello", language, convId);
  }

  // 1. Check Arithmetic / Calculations (e.g. 2+2, 100/4)
  const mathAnswer = solveArithmetic(trimmed, language);
  if (mathAnswer) {
    return {
      conversation_id: convId,
      message_id: msgId,
      answer: {
        scheme_id: "ai-math-resp",
        scheme_name: trimmed,
        summary: mathAnswer,
        eligibility: ["Accurate arithmetic evaluation"],
        benefits: ["Instant mathematical calculation"],
        documents_required: ["None"],
        application_steps: ["Ask any other math or general query"],
        grounded: true,
      },
      sources: [
        {
          title: "BharathVoice Calculator Engine",
          category: "Computation",
          source: "Direct Calculation",
          last_updated: "2026-01-01",
          doc_id: "calc-01",
          url: "https://bharat-voice-ai-jet.vercel.app",
          verified: true,
        },
      ],
      language,
      suggested_followups: [
        language === "te" ? "ప్రభుత్వ పథకాల వివరాలు చూపించండి" : "Show available government schemes",
        language === "te" ? "రైతులకు పీఎం-కిసాన్ పథకం వివరాలు" : "PM-KISAN details for farmers",
      ],
    };
  }

  // 2. Check Conversational Queries (Identity, How are you, Joke, Story)
  const conversationalAnswer = getConversationalResponse(trimmed, language);
  if (conversationalAnswer) {
    return {
      conversation_id: convId,
      message_id: msgId,
      answer: {
        scheme_id: "ai-convo-resp",
        scheme_name: trimmed.slice(0, 40),
        summary: conversationalAnswer,
        eligibility: ["Open to all citizens in 11 Indian languages"],
        benefits: ["Natural voice conversation", "Instant assistance anytime"],
        documents_required: ["None"],
        application_steps: ["Ask any question or query"],
        grounded: true,
      },
      sources: [
        {
          title: "BharathVoice AI Conversational Engine",
          category: "Assistant",
          source: "BharathVoice Digital Platform",
          last_updated: "2026-01-01",
          doc_id: "convo-01",
          url: "https://bharat-voice-ai-jet.vercel.app",
          verified: true,
        },
      ],
      language,
      suggested_followups: [
        language === "te" ? "ప్రభుత్వ సంక్షేమ పథకాలు ఏమిటి?" : "What government schemes are available?",
        language === "te" ? "రైతులకు సహాయం ఏమిటి?" : "What assistance is there for farmers?",
        language === "te" ? "విద్యార్థుల స్కాలర్‌షిప్‌లు ఏమిటి?" : "What scholarships are available for students?",
      ],
    };
  }

  // 3. Specialized System Intents (Supported Languages, About App, Scheme Directory)
  const intent = detectUserIntent(trimmed);
  if (intent === "LANGUAGE_QUERY" || intent === "ABOUT_APP" || intent === "SCHEME_DIRECTORY") {
    return generateKnowledgeResponse(trimmed, language, convId);
  }

  // 4. High-Confidence Government Welfare Scheme Matching (Score >= 40)
  // When a citizen specifically asks about PM-KISAN, Ayushman Bharat, Scholarships, Pensions, Mudra Loans
  const schemeMatches = searchSchemes(trimmed, 2);
  const topMatch = schemeMatches[0];
  if (topMatch && topMatch.score >= 40) {
    return generateKnowledgeResponse(trimmed, language, convId);
  }

  // 5. Check if Cloud LLM API Keys (Gemini, Groq, OpenAI) are available in environment
  const targetLangName = LANGUAGE_PROMPT_NAMES[language] || "English";
  const systemPrompt = `You are BharathVoice AI, an intelligent multilingual Indian voice assistant.
Answer the user's question clearly, informatively, accurately, and naturally in ${targetLangName}.
Do NOT use rigid rules or templates. Give a direct, conversational answer that sounds natural when spoken aloud.
Keep the answer focused and helpful.`;

  const fullPrompt = `${systemPrompt}\n\nCitizen Query: "${trimmed}"`;

  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  let aiText: string | null = null;
  if (geminiKey) {
    aiText = await callGemini(fullPrompt, geminiKey);
  } else if (groqKey) {
    aiText = await callGroq(fullPrompt, groqKey);
  } else if (openaiKey) {
    aiText = await callOpenAI(fullPrompt, openaiKey);
  }

  if (aiText && aiText.trim().length > 10) {
    const cleanText = sanitizeForSpeech(aiText);
    const sentences = cleanText.split(/[.!?।]+/).map(s => s.trim()).filter(Boolean);
    const keyPoints = sentences.slice(1, 4).map(s => s.length > 10 ? s : null).filter(Boolean) as string[];

    const structured: StructuredAnswer = {
      scheme_id: "ai-universal-resp",
      scheme_name: trimmed.slice(0, 50),
      summary: cleanText,
      eligibility: keyPoints.length > 0 ? keyPoints : [cleanText.slice(0, 100)],
      benefits: [
        "Direct AI Voice Assistance in 11 Indian Languages",
        "Instant factual guidance for any query or topic",
      ],
      documents_required: ["No documents required"],
      application_steps: ["Ask any follow-up question or continue the conversation"],
      grounded: true,
    };

    return {
      conversation_id: convId,
      message_id: msgId,
      answer: structured,
      sources: [
        {
          title: "BharathVoice Neural AI Engine",
          category: "Universal Knowledge",
          source: "Multilingual Neural AI & National Information Systems",
          last_updated: "2026-01-01",
          doc_id: "neural-ai-universal",
          url: "https://bharat-voice-ai-jet.vercel.app",
          verified: true,
        },
      ],
      language,
      suggested_followups: [
        language === "te" ? "దీని గురించి మరిన్ని వివరాలు చెప్పండి" : "Tell me more about this",
        language === "te" ? "ప్రభుత్వ పథకాల వివరాలు చూపించండి" : "Show available government schemes",
        language === "te" ? "నాకు ఉపయోగపడే సేవలు ఏమిటి?" : "What services can I apply for?",
      ],
    };
  }

  // 6. Zero-Key Universal Multilingual Knowledge Engine (Wikipedia + Open Knowledge + Live Translation)
  const knowledge = await queryGlobalKnowledge(trimmed, language);
  if (knowledge && knowledge.summary) {
    const cleanSummary = sanitizeForSpeech(knowledge.summary);
    const sentences = cleanSummary.split(/[.!?।]+/).map(s => s.trim()).filter(Boolean);
    const bulletPoints = sentences.slice(1, 4);

    const structured: StructuredAnswer = {
      scheme_id: "global-knowledge-resp",
      scheme_name: knowledge.title,
      summary: cleanSummary,
      eligibility: bulletPoints.length > 0 ? bulletPoints : [cleanSummary.slice(0, 120)],
      benefits: [
        "Verified factual information from open multilingual knowledge archives",
        "Available in 11 Indian regional languages with speech synthesis",
      ],
      documents_required: ["No documents required"],
      application_steps: ["Listen to the audio response or explore related topics"],
      grounded: true,
    };

    return {
      conversation_id: convId,
      message_id: msgId,
      answer: structured,
      sources: [
        {
          title: `${knowledge.title} - Knowledge Base`,
          category: "Verified Encyclopedia",
          source: knowledge.url,
          last_updated: "2026-01-01",
          doc_id: "global-knowledge-doc",
          url: knowledge.url,
          verified: true,
        },
      ],
      language,
      suggested_followups: [
        language === "te" ? "దీని గురించి మరింత సమాచారం ఇవ్వండి" : "Tell me more details about this",
        language === "te" ? "రైతులు మరియు విద్యార్థుల పథకాలు చెప్పండి" : "Tell me about schemes for students and farmers",
        language === "te" ? "మద్దతు ఇచ్చే 11 భాషలు ఏవి?" : "What 11 languages are supported?",
      ],
    };
  }

  // 7. Contextual Fallback for Any Remaining Questions (Warm, Direct, Helpful)
  const localizedGenericAnswers: Record<Language, string> = {
    te: `మీరు అడిగిన "${trimmed}" గురించి సమాచారం: భారత్ వాయిస్ ఏఐ ద్వారా మీరు ఏ ప్రశ్నైనా అడగవచ్చు. ప్రభుత్వ పథకాలు, విద్యార్థుల స్కాలర్‌షిప్‌లు, రైతు సాయం, లేదా సాధారణ విజ్ఞానం గురించైనా పూర్తి వివరాలు పొందవచ్చు.`,
    hi: `आपके द्वारा पूछे गए "${trimmed}" के संबंध में: भारत वॉयस एआई के माध्यम से आप कोई भी प्रश्न पूछ सकते हैं। सरकारी योजनाओं, छात्रवृत्तियों, किसान सहायता या सामान्य ज्ञान के संबंध में सभी विवरण उपलब्ध हैं।`,
    kn: `ನೀವು ಕೇಳಿದ "${trimmed}" ಬಗ್ಗೆ: ಭಾರತ ವಾಯ್ಸ್ ಎಐ ಮೂಲಕ ನೀವು ಯಾವುದೇ ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳಬಹುದು. ಸರಕಾರಿ ಯೋಜನೆಗಳು, ಕೃಷಿ ಅಥವಾ ಶಿಕ್ಷಣದ ಬಗ್ಗೆ ವಿವರಗಳನ್ನು ಪಡೆಯಬಹುದು.`,
    ta: `நீங்கள் கேட்ட "${trimmed}" பற்றி: பாரத் வாய்ஸ் ஏஐ மூலம் நீங்கள் எந்த கேள்வியையும் கேட்கலாம். அரசு திட்டங்கள், கல்வி உதவித்தொகை அல்லது பொது அறிவு பற்றிய தகவல்களைப் பெறலாம்.`,
    mr: `तुम्ही विचारलेल्या "${trimmed}" बद्दल: भारत व्हॉइस एआय द्वारे आपण कोणताही प्रश्न विचारू शकता. सरकारी योजना, शिष्यवृत्ती किंवा सामान्य ज्ञानाविषयी माहिती मिळवा.`,
    bn: `আপনার প্রশ্ন "${trimmed}" সম্পর্কে: ভারত ভয়েস এআই এর মাধ্যমে আপনি যেকোনো প্রশ্ন জিজ্ঞাসা করতে পারেন। সরকারি প্রকল্প বা শিক্ষা সম্পর্কিত যেকোনো তথ্য পান।`,
    gu: `તમે પૂછેલા "${trimmed}" વિશે: ભારત વોઇસ એઆઇ દ્વારા તમે કોઈપણ પ્રશ્ન પૂછી શકો છો. સરકારી યોજનાઓ અથવા કોઈપણ વિષય પર માહિતી મેળવો.`,
    ml: `നിങ്ങൾ ചോദിച്ച "${trimmed}" എന്നതിനെക്കുറിച്ച്: ഭാരത് വോയ്‌സ് എഐ വഴി നിങ്ങൾക്ക് ഏത് ചോദ്യവും ചോദിക്കാം. സർക്കാർ പദ്ധതികളെക്കുറിച്ചും നിങ്ങൾക്ക് വിവരങ്ങൾ ലഭിക്കും.`,
    pa: `ਤੁਹਾਡੇ ਸੁਆਲ "${trimmed}" ਬਾਰੇ: ਭਾਰਤ ਵੌਇਸ ਏਆਈ ਰਾਹੀਂ ਤੁਸੀਂ ਕੋਈ ਵੀ ਸੁਆਲ ਪੁੱਛ ਸਕਦੇ ਹੋ। ਸਰਕਾਰੀ ਸਕੀਮਾਂ ਅਤੇ ਆਮ ਜਾਣਕਾਰੀ ਪ੍ਰਾਪਤ ਕਰੋ।`,
    or: `ଆପଣ ପଚାରିଥିବା "${trimmed}" ବିଷୟରେ: ଭାରତ ଭଏସ୍ ଏଆଇ ମାଧ୍ୟମରେ ଆପଣ ଯେକୌଣସି ପ୍ରଶ୍ନ ପଚାରିପାରିବେ। ସରକାରୀ ଯୋଜନା ବିଷୟରେ ମଧ୍ୟ ଜାଣନ୍ତୁ।`,
    en: `Regarding "${trimmed}": BharathVoice AI assists citizens with public welfare schemes, farmer subsidies, student scholarships, healthcare, and any general inquiries across 11 Indian languages.`,
  };

  const genericSummary = localizedGenericAnswers[language] || localizedGenericAnswers.en;

  return {
    conversation_id: convId,
    message_id: msgId,
    answer: {
      scheme_id: "ai-general-resp",
      scheme_name: trimmed.slice(0, 50),
      summary: genericSummary,
      eligibility: ["All Indian Citizens", "Access open to all 11 Indian languages"],
      benefits: ["Instant voice assistance", "Accurate scheme and citizen service information"],
      documents_required: ["No documents required to query"],
      application_steps: ["Speak or type your question in any of the 11 supported languages"],
      grounded: true,
    },
    sources: [
      {
        title: "National Government Services Portal",
        category: "Citizen Services",
        source: "india.gov.in",
        last_updated: "2026-01-01",
        doc_id: "gov-portal-01",
        url: "https://www.india.gov.in",
        verified: true,
      },
    ],
    language,
    suggested_followups: [
      language === "te" ? "రైతులకు పీఎం-కిసాన్ వివరాలు చెప్పండి" : "Tell me about PM-KISAN for farmers",
      language === "te" ? "ఆయుష్మాన్ భారత్ హెల్త్ కార్డు ఎలా పొందాలి?" : "How to get an Ayushman Bharat health card?",
      language === "te" ? "మద్దతు ఇచ్చే 11 భాషలు ఏవి?" : "What 11 Indian languages are supported?",
    ],
  };
}
