import { ALL_SCHEMES, SCHEME_TRANSLATIONS, SchemeRecord } from "./knowledgeData";
import { getLocalizedScheme } from "./schemeLocalization";
import { ChatResponse, Language, SourceRef, StructuredAnswer } from "./types";

const SCRIPT_RANGES: Record<Language, [number, number]> = {
  hi: [0x0900, 0x097f], // Devanagari (Hindi)
  mr: [0x0900, 0x097f], // Devanagari (Marathi)
  te: [0x0c00, 0x0c7f], // Telugu
  kn: [0x0c80, 0x0cff], // Kannada
  ta: [0x0b80, 0x0bff], // Tamil
  bn: [0x0980, 0x09ff], // Bengali
  gu: [0x0a80, 0x0aff], // Gujarati
  pa: [0x0a00, 0x0a7f], // Gurmukhi (Punjabi)
  or: [0x0b00, 0x0b7f], // Odia
  ml: [0x0d00, 0x0d7f], // Malayalam
  en: [0x0041, 0x007a], // Basic Latin
};

const MARATHI_MARKERS = ["आहे", "काय", "कसे", "करावे", "योजना", "माहिती", "अर्ज", "शेतकरी", "विद्यार्थी", "मिळेल"];

export function detectLanguage(text: string, fallback: Language = "en"): Language {
  const counts: Record<string, number> = {
    hi: 0,
    te: 0,
    kn: 0,
    ta: 0,
    bn: 0,
    gu: 0,
    pa: 0,
    or: 0,
    ml: 0,
    en: 0,
  };

  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    for (const [lang, [start, end]] of Object.entries(SCRIPT_RANGES) as [Language, [number, number]][]) {
      if (lang === "mr") continue; // Handled specially below
      if (code >= start && code <= end) {
        counts[lang] = (counts[lang] || 0) + 1;
      }
    }
  }

  // Priority to Indian regional scripts
  if (counts.te > 0) return "te";
  if (counts.ta > 0) return "ta";
  if (counts.kn > 0) return "kn";
  if (counts.bn > 0) return "bn";
  if (counts.gu > 0) return "gu";
  if (counts.ml > 0) return "ml";
  if (counts.pa > 0) return "pa";
  if (counts.or > 0) return "or";

  // Devanagari script: determine between Marathi and Hindi
  if (counts.hi > 0) {
    if (fallback === "mr" || MARATHI_MARKERS.some((m) => text.includes(m))) {
      return "mr";
    }
    return "hi";
  }

  return fallback || "en";
}

export type UserIntent =
  | "LANGUAGE_QUERY"
  | "ABOUT_APP"
  | "SCHEME_DIRECTORY"
  | "ELIGIBILITY"
  | "DOCUMENTS"
  | "APPLICATION_STEPS"
  | "BENEFITS"
  | "GREETING"
  | "SCHOLARSHIPS"
  | "AGRICULTURE"
  | "HEALTHCARE"
  | "EMPLOYMENT"
  | "WELFARE_PENSION"
  | "GENERAL_SCHEME";

const INTENT_PATTERNS = {
  ELIGIBILITY: [
    "eligible", "eligibility", "who can apply", "criteria", "age limit", "income limit", "qualify",
    "पात्र", "पात्रता", "कौन आवेदन", "शर्तें", "नियम",
    "అర్హత", "అర్హులు", "ఎవరు దరఖాస్తు", "నియమాలు",
    "ಅರ್ಹತೆ", "ಅರ್ಹರು", "ಯಾರು ಅರ್ಜಿ",
    "தகுதி", "விண்ணப்பிக்க தகுதி", "யார் விண்ணப்பிக்கலாம்",
    "पात्रता", "कोण अर्ज करू शकतो", "अटी",
    "যোগ্যতা", "কে আবেদন করতে পারে", "শর্ত",
    "પાત્રતા", "કોણ અરજી કરી શકે", "નિયમો",
    "അർഹത", "ആർക്കൊക്കെ അപേക്ഷിക്കാം",
    "ਯੋਗਤਾ", "ਕੌਣ ਅਰਜ਼ੀ ਦੇ ਸਕਦਾ ਹੈ",
    "ଯୋଗ୍ୟତା", "କିଏ ଆବେଦନ କରିପାରିବେ",
  ],
  DOCUMENTS: [
    "document", "documents", "papers", "aadhaar", "certificate", "records", "proof", "ration card",
    "दस्तावेज", "कागजात", "आधार", "प्रमाणपत्र",
    "పత్రాలు", "డాక్యుమెంట్", "సర్టిఫికేట్", "ఆధార్",
    "ದಾಖಲೆ", "ದಾಖಲೆಗಳು", "ಪ್ರಮಾಣಪತ್ರ", "ಆಧಾರ್",
    "ஆவணங்கள்", "சான்றிதழ்", "ஆதார்",
    "कागदपत्रे", "दाखला", "आधार कार्ड",
    "নথিপত্র", "কাগজপত্র", "সার্টিফিকেট", "আধার",
    "દસ્તાવેજો", "કાગળો", "પ્રમાણપત્ર", "આધાર",
    "രേഖകൾ", "സർട്ടിഫിക്കറ്റ്", "ആധാർ",
    "ਦਸਤਾਵੇਜ਼", "ਕਾਗਜ਼ਾਤ", "ਆਧਾਰ",
    "ଦସ୍ତାବିଜ", "ପ୍ରମାଣପତ୍ର", "ଆଧାର",
  ],
  APPLICATION_STEPS: [
    "how to apply", "application", "procedure", "steps", "where to apply", "register", "online portal", "link",
    "आवेदन कैसे", "प्रक्रिया", "कहाँ आवेदन", "पंजीकरण",
    "ఎలా దరఖాస్తు", "విధానం", "దరఖాస్తు విధానం", "రిజిస్ట్రేషన్",
    "ಅರ್ಜಿ ಸಲ್ಲಿಸುವುದು ಹೇಗೆ", "ವಿಧಾನ", "ನೋಂದಣಿ",
    "விண்ணப்பிப்பது எப்படி", "பதிவு செய்வது ಹೇಗೆ",
    "कसा अर्ज करावा", "नोंदणी कशी करावी", "पद्धत",
    "কীভাবে আবেদন করবেন", "পদ্ধতি", "নিবন্ধন",
    "કેવી રીતે અરજી કરવી", "નોંધણી",
    "എങ്ങനെ അപേക്ഷിക്കാം", "രജിസ്ട്രേഷൻ",
    "ਕਿਵੇਂ ਅਰਜ਼ੀ ਦੇਣੀ ਹੈ", "ਰਜਿਸਟ੍ਰੇਸ਼ਨ",
    "କିପରି ଆବେଦନ କରିବେ", "ପଞ୍ଜୀକରଣ",
  ],
  BENEFITS: [
    "benefit", "benefits", "money", "amount", "financial", "cash", "subsidy", "installment", "how much",
    "लाभ", "पैसे", "राशि", "सब्सिडी", "किस्त", "कितना मिलेगा",
    "ప్రయోజనాలు", "డబ్బులు", "ఎంత లభిస్తుంది", "సబ్సిడీ", "విడత",
    "ಪ್ರಯೋಜನಗಳು", "ಹಣ", "ಎಷ್ಟು ಸಿಗುತ್ತದೆ", "ಸಹಾಯಧನ",
    "நன்மைகள்", "பணம்", "எவ்வளவு கிடைக்கும்", "மானியம்",
    "फायदे", "पैसे", "अनुदान", "हप्ता", "किती मिळतील",
    "সুবিধা", "টাকা", "কত টাকা", "ভর্তুকি", "কিস্তি",
    "લાભો", "રૂપિયા", "સબસિડી", "હપ્તો", "કેટલા મળશે",
    "ആനുകൂല്യങ്ങൾ", "പണം", "എത്ര ലഭിക്കും",
    "ਲਾਭ", "ਪੈਸੇ", "ਸਬਸਿਡੀ", "ਕਿਸ਼ਤ",
    "ଲାଭ", "ଟଙ୍କା", "କେତେ ମିଳିବ",
  ],
  GREETING: [
    "hello", "hi", "namaste", "vanakkam", "namaskara", "namashkar", "hey", "who are you", "what can you do", "help",
    "नमस्ते", "प्रणाम", "नमस्ते जी", "आप कौन हैं",
    "నమస్కారం", "హలో", "మీరు ఎవరు", "సహాయం",
    "ನಮಸ್ಕಾರ", "ಹಲೋ", "ನೀವು ಯಾರು", "ಸಹಾಯ ಮಾಡಿ",
    "வணக்கம்", "ஹலோ", "நீங்கள் யார்", "உதவி",
    "नमस्कार", "तुम्ही कोण आहात", "मदत करा",
    "নমস্কার", "হ্যালো", "আপনি কে", "সাহায্য করুন",
    "નમસ્તે", "કેમ છો", "તમે કોણ છો", "મદદ",
    "നമസ്കാരം", "ഹലോ", "ആരാണ് നിങ്ങൾ",
    "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ", "ਨਮਸਤੇ", "ਤੁਸੀਂ ਕੌਣ ਹੋ",
    "ନମସ୍କାର", "ଆପଣ କିଏ",
  ],
};

export function detectUserIntent(query: string): UserIntent {
  const q = query.trim().toLowerCase();
  const tokens = q.split(/[\s,?.!;:()\[\]{}]+/).filter(Boolean);

  // 1. Language inquiry intent (e.g. "Indian languages are there", "which languages", "bhashalu")
  const languageWords = [
    "language", "languages", "indian languages", "indian language", "bhasha", "bhashalu", "bhashe", "mozhi", "boli", "voice languages",
    "భాష", "భాషలు", "ఏ భాషలు", "ఇండియన్ భాషలు", "ఎన్ని భాషలు",
    "भाषा", "भाषाएं", "कितनी भाषाएं", "कौन सी भाषा", "भारतीय भाषाएं",
    "ಭಾಷೆ", "ಭಾಷೆಗಳು", "ಯಾವ ಭಾಷೆ",
    "மொழி", "மொழிகள்",
    "ভাষা", "ભાષા", "ભાષાઓ", "ഭാഷ", "ਬੋਲੀ"
  ];
  if (languageWords.some((lw) => q.includes(lw))) {
    return "LANGUAGE_QUERY";
  }

  // 2. About app / capabilities intent
  const aboutWords = [
    "who are you", "what are you", "what is this", "what is bharath voice", "what is bharathvoice", "what can you do", "help me", "how to use", "features", "your name",
    "నువ్వు ఎవరు", "మీరు ఎవరు", "భారతవాయిస్ అంటే ఏమిటి", "నువ్వు ఏమి చేయగలవు", "సహాయం చేయండి", "నీ పేరేంటి",
    "आप कौन हैं", "तुम कौन हो", "भारतवॉयस क्या है", "आप क्या कर सकते हैं", "मदद करें",
    "ನೀವು ಯಾರು", "நீங்கள் யார்", "তুমি কে", "તમે કોણ છો"
  ];
  if (aboutWords.some((aw) => q.includes(aw))) {
    return "ABOUT_APP";
  }

  // 3. Scheme directory / list all schemes intent
  const directoryWords = [
    "all schemes", "list schemes", "list of schemes", "what schemes", "show schemes", "schemes list", "directory", "all yojana", "how many schemes", "available schemes",
    "అన్ని పథకాలు", "పథకాల జాబితా", "పథకాలు చెప్పండి", "ఏమేం పథకాలు ఉన్నాయి", "పథకాలు ఏమిటి", "ఎన్ని పథకాలు",
    "सभी योजनाएं", "योजनाओं की सूची", "योजनाएं बताओ", "सरकारी योजनाएं", "कितनी योजनाएं",
    "ಎಲ್ಲಾ ಯೋಜನೆಗಳು", "திட்டங்களின் பட்டியல்", "সকল প্রকল্প"
  ];
  if (directoryWords.some((dw) => q.includes(dw))) {
    return "SCHEME_DIRECTORY";
  }

  // 4. Functional intents (eligibility, documents, steps, benefits)
  for (const word of INTENT_PATTERNS.ELIGIBILITY) {
    const w = word.toLowerCase();
    if (w.length <= 3 ? tokens.includes(w) : q.includes(w)) return "ELIGIBILITY";
  }
  for (const word of INTENT_PATTERNS.DOCUMENTS) {
    const w = word.toLowerCase();
    if (w.length <= 3 ? tokens.includes(w) : q.includes(w)) return "DOCUMENTS";
  }
  for (const word of INTENT_PATTERNS.APPLICATION_STEPS) {
    const w = word.toLowerCase();
    if (w.length <= 3 ? tokens.includes(w) : q.includes(w)) return "APPLICATION_STEPS";
  }
  for (const word of INTENT_PATTERNS.BENEFITS) {
    const w = word.toLowerCase();
    if (w.length <= 3 ? tokens.includes(w) : q.includes(w)) return "BENEFITS";
  }
  for (const word of INTENT_PATTERNS.GREETING) {
    const w = word.toLowerCase();
    if (w.length <= 4) {
      if (tokens.includes(w) && tokens.length <= 3) return "GREETING";
    } else {
      if (q.includes(w) && (tokens.length <= 6 || q.startsWith(w))) return "GREETING";
    }
  }

  return "GENERAL_SCHEME";
}

const SYNONYMS: Record<string, string[]> = {
  scholarship: [
    "scholarship", "scholarships", "merit", "pragati", "deevena", "vidya", "education", "student", "students", "fee", "college", "school",
    "chaduvu", "vidyarthi", "vidyarthulu", "fees", "fee reimbursement", "nmmss", "post matric", "pre matric", "btech",
    "छात्रवृत्ति", "छात्र", "विद्या", "विद्यार्थी", "पढ़ाई", "कॉलेज", "स्कूल", "फीस",
    "స్కాలర్‌షిప్", "స్కాలర్షిప్", "విద్యార్థి", "విద్యార్థులకు", "విద్య", "ఫీజు", "చదువు", "కాలేజ్",
    "ವಿದ್ಯಾರ್ಥಿವೇತನ", "ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ", "ವಿದ್ಯಾರ್ಥಿ",
    "கல்வி உதவித்தொகை", "மாணவர்", "மாணவர்கள்", "படிப்பு",
    "शिष्यवृत्ती", "विद्यार्थी", "शिक्षण", "फी",
    "স্কলারশিপ", "ছাত্র", "ছাত্রী", "শিক্ষা",
    "સ્કોલરશિપ", "વિદ્યાર્થી", "શિક્ષણ", "ફી",
    "സ്കോളർഷിപ്പ്", "വിദ്യാർത്ഥി", "പഠനം",
    "ਵਜ਼ੀਫ਼ਾ", "ਵਿਦਿਆਰਥੀ", "ਪੜ੍ਹਾਈ",
    "ସ୍କଲାରସିପ୍", "ଛାତ୍ର", "ଶିକ୍ଷା",
  ],
  agriculture: [
    "agriculture", "farmer", "farmers", "kisan", "crop", "fertilizer", "soil", "rythu", "raithu", "rythulu", "bharosa", "pm-kisan", "pm kisan", "pmkisan", "fasal", "bima", "panta", "pantalu", "vyavasayam", "pasupu", "seeds",
    "कृषि", "किसान", "किसानों", "खेती", "फसल", "बीज", "खाद", "पीएम किसान",
    "రైతు", "రైతులకు", "రైతులు", "రైతు భరోసా", "వ్యవసాయం", "పంట", "పంటలు", "విత్తనాలు", "ఎరువులు", "పీఎం కిసాన్", "ఫసల్ బీమా",
    "ಕೃಷಿ", "ರೈತ", "ರೈತರಿಗೆ", "ರೈತರು", "ಬೆಳೆ",
    "விவசாயம்", "விவசாயி", "பயிர்", "உழவர்",
    "शेती", "शेतकरी", "पीक", "खत",
    "কৃষি", "কৃষক", "ফসল",
    "ખેતી", "ખેડૂત", "પાક",
    "കൃഷി", "കർഷകൻ", "വിള",
    "ਖੇਤੀ", "ਕਿਸਾਨ", "ਫ਼ਸਲ",
    "କୃଷି", "କୃଷକ", "ଫସଲ",
  ],
  health: [
    "health", "ayushman", "bharat", "hospital", "treatment", "medicine", "insurance", "card", "aarogya", "arogya", "aarogyasri", "arogyasri", "pm-jay", "pmjay", "golden card", "asupatri", "chikitsha", "mandulu", "surgery",
    "स्वास्थ्य", "इलाज", "अस्पताल", "दवा", "आयुष्मान", "गोल्डन कार्ड", "बीमा",
    "ఆరోగ్యం", "ఆస్పత్రి", "ఆసుపత్రి", "చికిత్స", "ఆయుష్మాన్", "ఆరోగ్యశ్రీ", "మందులు", "హెల్త్ కార్డు",
    "ಆರೋಗ್ಯ", "ಆಸ್ಪತ್ರೆ", "ಚಿಕಿತ್ಸೆ", "ಆಯುಷ್ಮಾನ್",
    "சுகாதாரம்", "மருத்துவம்", "மருத்துவமனை", "காப்பீடு",
    "आरोग्य", "दवाखाना", "उपचार", "विमा",
    "স্বাস্থ্য", "হাসপাতাল", "চিকিৎসা", "বীমা",
    "આરોગ્ય", "હોસ્પિટલ", "સારવાર", "વીમો",
    "ആരോഗ്യം", "ആശുപത്രി", "ചികിത്സ",
    "ਸਿਹਤ", "ਹਸਪਤਾਲ", "ਇਲਾਜ", "ਬੀਮਾ",
    "ସ୍ୱାସ୍ଥ୍ୟ", "ଡାକ୍ତରଖାନା", "ଚିକିତ୍ସା",
  ],
  employment: [
    "employment", "job", "jobs", "mudra", "skill", "training", "startup", "business", "loan", "loans", "credit", "rozgar", "svanidhi", "vyaparam", "udyoga", "udyogam", "appu", "runam", "self employed", "naukri",
    "रोजगार", "नौकरी", "ऋण", "लोन", "मुद्रा", "व्यापार", "दुकान", "व्यवसाय",
    "ఉపాధి", "ఉద్యోగం", "ఉద్యోగాలు", "రుణం", "ముద్రా", "ముద్ర", "వ్యాపారం", "అప్పు", "స్వయం ఉపాధి",
    "ಉದ್ಯೋಗ", "ಕೆಲಸ", "ಸಾಲ", "ಮುದ್ರಾ", "ವ್ಯವಹಾರ",
    "வேலைவாய்ப்பு", "தொழில்", "கடன்", "முத்ரா",
    "रोजगार", "नोकरी", "कर्ज", "मुद्रा", "व्यवसाय",
    "কর্মসংস্থান", "চাকরি", "ঋণ", "মুদ্রা", "ব্যবসা",
    "રોજગાર", "નોકરી", "લોન", "મુદ્રા", "વેપાર",
    "തൊഴിൽ", "ജോലി", "വായ്പ", "മുദ്ര",
    "ਰੋਜ਼ਗਾਰ", "ਨੌਕਰੀ", "ਕਰਜ਼ਾ", "ਮੁਦਰਾ",
    "ନିଯୁକ୍ତି", "ଚାକିରି", "ଋଣ", "ମୁଦ୍ରା",
  ],
  welfare: [
    "welfare", "pension", "ration", "ration card", "food", "poor", "senior", "poverty", "awas", "housing", "sukanya", "samriddhi", "girl", "biyyam", "illu", "indlu", "houses", "pedalu", "ammavodi", "aadabidda",
    "कल्याण", "पेंशन", "राशन", "गरीब", "आवास", "सुकन्या", "मकान", "घर",
    "సంక్షేమం", "పెన్షన్", "పింఛన్", "రేషన్", "రేషన్ కార్డు", "బియ్యం", "ఇల్లు", "ఇండ్లు", "ఆవాస్", "పేదలు", "ఆడపిల్ల", "సుకున్య",
    "ಸಹಾಯಧನ", "ಪಿಂಚಣಿ", "ಪಡಿತರ", "ವಸತಿ", "ಆವಾಸ್",
    "நலத்திட்டம்", "ஓய்வூதியம்", "ரேஷன்", "வீடு",
    "कल्याण", "पेन्शन", "रेशन", "घरकुल", "आवास",
    "কল্যাণ", "পেনশন", "রেশন", "আবাস",
    "કલ્યાણ", "પેન્શન", "રાશન", "આવાસ",
    "ക്ഷേമം", "പെൻഷൻ", "റേഷൻ", "ഭവനം",
    "ਭਲਾਈ", "ਪੈਨਸ਼ਨ", "ਰਾਸ਼ਨ", "ਆਵਾਸ",
    "କଲ୍ୟାଣ", "ପେନସନ", "ରାସନ", "ଆବାସ",
  ],
};

const STOP_WORDS = new Set([
  "are", "is", "was", "were", "the", "and", "or", "in", "on", "at", "to", "for", "of", "a", "an",
  "do", "does", "did", "can", "could", "will", "would", "there", "here", "it", "this", "that",
  "these", "those", "have", "has", "had", "be", "been", "being", "with", "from", "by", "as",
  "about", "all", "what", "how", "when", "where", "who", "which", "why", "many", "much", "tell",
  "me", "give", "show", "any", "some", "my", "your", "our", "their", "them", "us", "you", "i",
  "details", "information", "info", "please"
]);

const GENERAL_SCHEME_WORDS = [
  "scheme", "schemes", "yojana", "yojanagalu", "yojanaye", "pathakam", "pathakalu",
  "యोजना", "యोजनाలు", "పథకం", "పథకాలు", "సర్కారు పథకాలు", "ప్రభుత్వ పథకాలు",
  "योजना", "योजनाएं", "सरकारी योजनाएं",
  "திட்டம்", "திட்டங்கள்", "প্রকল্প", "યોજના", "പദ്ധതി", "ਸਕੀਮਾਂ", "ଯୋଜନା",
];

export function searchSchemes(query: string, limit = 4): { scheme: SchemeRecord; score: number }[] {
  const qLower = query.toLowerCase();
  const rawWords = qLower.split(/[\s,?.!;:()\[\]{}]+/).filter((w) => w.length > 1);
  const words = rawWords.filter((w) => w.length > 2 && !STOP_WORDS.has(w));
  const isGeneralQuery = GENERAL_SCHEME_WORDS.some((gw) => qLower.includes(gw.toLowerCase()));

  const SCHEME_KEYWORD_RULES: Record<string, string[]> = {
    "agr-001": [
      "kisan", "pm-kisan", "pmkisan", "rythu", "raithu", "raithulu", "rythulu", "farmer", "farmers", "agriculture", "6000",
      "రైతు", "రైతులు", "రైతులకు", "కిసాన్", "వ్యవసాయం", "పెట్టుబడి", "రైతు భరోసా", "సాగు", "సమ్మాన్ నిధి",
      "किसान", "किसान सम्मान", "खेती", "कृषि", "रैत", "ಕೃಷಿ", "ರೈತ", "விவசாயி"
    ],
    "agr-002": [
      "fasal", "bima", "pmfby", "crop insurance", "crop loss", "damage", "flood", "drought",
      "పంట బీమా", "పంట నష్టం", "ఫసల్ బీమా", "వరి", "వర్షాభావం", "ఫసల్", "భీమా",
      "फसल बीमा", "फसल", "नुकसान", "ಬೆಳೆ ವಿಮೆ", "பயிர் காப்பீடு"
    ],
    "wel-001": [
      "ayushman", "ayushman bharat", "pmjay", "pm-jay", "jan arogya", "health card", "golden card", "hospital", "hospitals", "treatment", "cashless", "surgery", "medicine", "medical", "doctor", "health", "healthcare", "aarogya", "arogya", "aarogyasri", "arogyasri", "asupatri", "aspathri",
      "ఆయుష్మాన్", "ఆయుష్మాన్ భారత్", "ఆరోగ్యం", "ఆరోగ్యశ్రీ", "ఆసుపత్రి", "ఆస్పత్రి", "వైద్యం", "చికిత్స", "ఉచిత వైద్యం", "హెల్త్ కార్డు", "మందులు", "శస్త్రచికిత్స", "జబ్బు", "రోగం", "రోగి",
      "आयुष्मान", "आयुष्मान भारत", "अस्पताल", "इलाज", "दवा", "आरोग्य", "ಆಸ್ಪತ್ರೆ", "ಚಿಕಿತ್ಸೆ", "மருத்துவமனை", "சிகிச்சை"
    ],
    "wel-002": [
      "pension", "pensions", "old age", "senior citizen", "senior", "elderly", "retire", "ignoaps", "nsap", "vridhapya", "vruddhapya", "avvatata", "musali",
      "పెన్షన్", "పింఛన్", "వృద్ధాప్య", "వృద్ధాప్య పింఛను", "వృద్ధులు", "ముసలి", "అవ్వాతాత", "జీవన భృతి", "పించన్", "పెన్షన్లు",
      "पेंशन", "वृद्धावस्था", "बुजुर्ग", "वरिष्ठ नागरिक", "ಪಿಂಚಣಿ", "ವೃದ್ಧಾಪ್ಯ", "ஓய்வூதியம்"
    ],
    "sch-001": [
      "nmms", "nmmss", "merit scholarship", "8th class", "9th class", "school scholarship", "scholarship", "scholarships",
      "స్కాలర్‌షిప్", "స్కాలర్షిప్", "ఎన్ఎమ్ఎమ్ఎస్", "మెరిట్ స్కాలర్‌షిప్", "ఉపకార వేతనం",
      "छात्रवृत्ति", "एनएमएमएस", "ವಿದ್ಯಾರ್ಥಿವೇತನ", "கல்வி உதவித்தொகை"
    ],
    "sch-002": [
      "pragati", "aicte", "girl scholarship", "girl student", "female scholarship", "girls", "ammayi", "aadabidda",
      "ప్రగతి", "బాలికల స్కాలర్‌షిప్", "అమ్మాయిల స్కాలర్‌షిప్", "ప్రగతి స్కాలర్షిప్",
      "प्रगति", "बालिका छात्रवृत्ति", "छात्राओं"
    ],
    "sch-003": [
      "vidya deevena", "deevena", "fee reimbursement", "college fee", "tuition fee", "fee", "jagananna", "vidya", "vasathi deevena", "degree fee",
      "విద్యా దీవెన", "ఫీజు రీయింబర్స్‌మెంట్", "ఫీజు", "కాలేజ్ ఫీజు", "డిగ్రీ ఫీజు", "జగనన్న విద్యా దీవెన", "వసతి దీవెన", "చదువు",
      "फीस प्रतिपूर्ति", "कॉलेज फीस"
    ],
    "edu-001": [
      "samagra shiksha", "school", "schools", "textbooks", "uniform", "midday meal", "primary school",
      "సమగ్ర శిక్షా", "పాఠశాల", "ఉచిత పుస్తకాలు", "యూనిఫాం", "మధ్యాహ్న భోజనం", "బడి", "పుస్తకాలు",
      "समग्र शिक्षा", "स्कूल"
    ],
    "edu-002": [
      "vidyalaxmi", "education loan", "study loan", "student loan", "college loan", "abroad study", "higher education loan",
      "విద్యా రుణం", "ఎడ్యుకేషన్ లోన్", "చదువు లోన్", "విద్యాలక్ష్మి", "స్టడీ లోన్",
      "विद्यालक्ष्मी", "शिक्षा ऋण"
    ],
    "emp-001": [
      "kaushal", "kaushal vikas", "pmkvy", "skill", "skills", "skill development", "training", "free training", "certificate course", "job training",
      "నైపుణ్య శిక్షణ", "కౌశల్ వికాస్", "ఉచిత శిక్షణ", "జాబ్ ట్రైనింగ్", "సర్టిఫికేట్ కోర్స్", "కౌశల్",
      "कौशल विकास", "कौशल", "ट्रेनिंग"
    ],
    "emp-002": [
      "pmegp", "business loan", "startup loan", "mudra", "mudra loan", "loan", "loans", "subsidy loan", "self employment", "shop loan", "small business", "runam", "appu", "vyaparam", "vyapar",
      "వ్యాపార రుణం", "వ్యాపారం", "లోన్", "సబ్సిడీ రుణం", "స్వయం ఉపాధి", "పీఎంఈజీపీ", "ముద్రా రుణం", "అప్పు", "రుణం", "చేతివృత్తులు",
      "पीएमईजीपी", "बिजनेस लोन", "मुद्रा लोन", "व्यापार ऋण", "स्वरोजगार"
    ],
    "gov-001": [
      "aadhaar", "aadhar", "uidai", "aadhaar card", "biometric", "fingerprint", "address update", "dob change",
      "ఆధార్", "ఆధార్ కార్డు", "బయోమెట్రిక్", "అడ్రస్ మార్పు", "ఆధార్ అప్‌డేట్",
      "आधार", "आधार कार्ड"
    ],
    "gov-002": [
      "caste certificate", "income certificate", "residence certificate", "certificate", "certificates", "meeseva", "sachivalayam", "tahsildar",
      "కుల ధృవీకరణ", "ఆదాయ ధృవీకరణ", "సర్టిఫికేట్", "మీసేవా", "సచివాలయం", "కులం", "ఆదాయం",
      "जाति प्रमाण पत्र", "आय प्रमाण पत्र", "प्रमाणपत्र"
    ]
  };

  const scored = ALL_SCHEMES.map((scheme) => {
    let score = isGeneralQuery ? 15 : 0;
    const sId = scheme.id.toLowerCase();
    const sTitle = scheme.title.toLowerCase();
    const sCat = scheme.category.toLowerCase();
    const sDesc = scheme.description.toLowerCase();
    const sAll = `${sTitle} ${sCat} ${sDesc} ${(scheme.eligibility || []).join(" ")} ${(scheme.benefits || []).join(" ")}`.toLowerCase();

    // Check specific keyword rules (+90 boost for target scheme)
    const ruleKeywords = SCHEME_KEYWORD_RULES[sId] || [];
    for (const kw of ruleKeywords) {
      const kwLower = kw.toLowerCase();
      if (qLower.includes(kwLower) || words.includes(kwLower)) {
        score += 90;
        break;
      }
    }

    // Exact match boost
    if (sTitle.includes(qLower)) score += 60;
    if (sDesc.includes(qLower)) score += 30;

    // Token-based matching to avoid false substring matches like "welfare".includes("are")
    const sTitleTokens = sTitle.split(/[\s,?.!;:()\[\]{}\/-]+/);
    const sCatTokens = sCat.split(/[\s,?.!;:()\[\]{}\/-]+/);
    const sDescTokens = sDesc.split(/[\s,?.!;:()\[\]{}\/-]+/);

    for (const word of words) {
      if (sTitleTokens.includes(word)) score += 20;
      else if (sCatTokens.includes(word)) score += 15;
      else if (sDescTokens.includes(word)) score += 8;
      else if (word.length >= 4 && sTitle.includes(word)) score += 10;

      for (const [catKey, synList] of Object.entries(SYNONYMS)) {
        if (synList.some((syn) => syn === word || (word.length >= 4 && syn.includes(word)))) {
          if (sCatTokens.includes(catKey) || sTitle.includes(catKey)) score += 25;
          if (sAll.includes(catKey)) score += 10;
        }
      }
    }

    return { scheme, score };
  });

  scored.sort((a, b) => b.score - a.score);

  // If no scheme scored positive, intelligently route based on broad topic keywords
  if (!scored[0] || scored[0].score <= 0) {
    if (qLower.includes("health") || qLower.includes("hospital") || qLower.includes("medical") || qLower.includes("ఆరోగ్య") || qLower.includes("ఆసుపత్రి") || qLower.includes("వైద్య")) {
      const hlt = ALL_SCHEMES.find((s) => s.id === "wel-001");
      if (hlt) return [{ scheme: hlt, score: 35 }];
    }
    if (qLower.includes("pension") || qLower.includes("పెన్షన్") || qLower.includes("పింఛన్") || qLower.includes("వృద్ధాప్య")) {
      const pen = ALL_SCHEMES.find((s) => s.id === "wel-002");
      if (pen) return [{ scheme: pen, score: 35 }];
    }
    if (qLower.includes("scholarship") || qLower.includes("స్కాలర్‌షిప్") || qLower.includes("విద్యా") || (qLower.includes("student") && !qLower.includes("language"))) {
      const sch = ALL_SCHEMES.find((s) => s.id === "sch-003" || s.id === "sch-001");
      if (sch) return [{ scheme: sch, score: 35 }];
    }
    if (qLower.includes("loan") || qLower.includes("business") || qLower.includes("వ్యాపార") || qLower.includes("రుణం") || qLower.includes("లోన్")) {
      const emp = ALL_SCHEMES.find((s) => s.id === "emp-002");
      if (emp) return [{ scheme: emp, score: 35 }];
    }
    if (qLower.includes("skill") || qLower.includes("training") || qLower.includes("శిక్షణ")) {
      const trn = ALL_SCHEMES.find((s) => s.id === "emp-001");
      if (trn) return [{ scheme: trn, score: 35 }];
    }
    // Return empty array! Do NOT default to a random scheme so non-scheme queries are handled accurately.
    return [];
  }

  return scored.slice(0, limit);
}

const LOCALIZED_FOLLOWUPS: Record<Language, string[]> = {
  en: [
    "What documents do I need for this?",
    "Am I eligible based on my state and age?",
    "How do I apply step by step?",
  ],
  hi: [
    "इसके लिए कौन-से दस्तावेज चाहिए?",
    "क्या मैं इसके लिए पात्र हूँ?",
    "आवेदन प्रक्रिया विस्तार से बताएं",
  ],
  te: [
    "దీనికి కావలసిన పత్రాలు ఏమిటి?",
    "నేను దరఖాస్తు చేసుకోవడానికి అర్హుడనా?",
    "దరఖాస్తు విధానం దశలవారీగా చెప్పండి",
  ],
  kn: [
    "ಇದಕ್ಕೆ ಯಾವ ದಾಖಲೆಗಳು ಬೇಕು?",
    "ನಾನು ಇದಕ್ಕೆ ಅರ್ಹನೇ?",
    "ಅರ್ಜಿ ಸಲ್ಲಿಸುವ ವಿಧಾನವನ್ನು ತಿಳಿಸಿ",
  ],
  ta: [
    "இதற்கு என்ன ஆவணங்கள் தேவை?",
    "நான் விண்ணப்பிக்க தகுதியுடையவரா?",
    "விண்ணப்பிக்கும் முறையை விளக்குங்கள்",
  ],
  mr: [
    "यासाठी कोणती कागदपत्रे लागतील?",
    "मी यासाठी पात्र आहे का?",
    "अर्ज कसा करावा सविस्तर सांगा",
  ],
  bn: [
    "এর জন্য কী কী নথি প্রয়োজন?",
    "আমি কি এই প্রকল্পের জন্য যোগ্য?",
    "আবেদন পদ্ধতি বিস্তারিত বলুন",
  ],
  gu: [
    "આના માટે કયા દસ્તાવેજો જોઈશે?",
    "શું હું આના માટે પાત્ર છું?",
    "અરજી કરવાની પ્રક્રિયા સમજાવો",
  ],
  ml: [
    "ഇതിന് എന്തൊക്കെ രേഖകൾ വേണം?",
    "ഞാൻ ഇതിന് അർഹനാണോ?",
    "അപേക്ഷിക്കേണ്ട രീതി വ്യക്തമാക്കുക",
  ],
  pa: [
    "ਇਸ ਲਈ ਕਿਹੜੇ ਦਸਤਾਵੇਜ਼ ਚਾਹੀਦੇ ਹਨ?",
    "ਕੀ ਮੈਂ ਇਸ ਲਈ ਯੋਗ ਹਾਂ?",
    "ਅਰਜ਼ੀ ਦੇਣ ਦੀ ਪ੍ਰਕਿਰਿਆ ਦੱਸੋ",
  ],
  or: [
    "ଏଥିପାଇଁ କେଉଁ ଦସ୍ତାବିଜ ଆବଶ୍ୟକ?",
    "ମୁଁ ଏଥିପାଇଁ ଯୋଗ୍ୟ କି?",
    "ଆବେଦନ ପ୍ରକ୍ରିୟା ବୁଝାନ୍ତୁ",
  ],
};

const GREETING_RESPONSES: Record<Language, { summary: string; followups: string[] }> = {
  en: {
    summary:
      "Namaste! I am BharathVoice AI, your voice-first citizen welfare assistant. You can speak or type in 11 Indian languages. Ask me about student scholarships, farmer subsidies, healthcare cards (Ayushman Bharat), business loans (Mudra), or social security pensions.",
    followups: [
      "What scholarships are available for students?",
      "Tell me about PM-KISAN for farmers",
      "How to get an Ayushman Bharat health card?",
    ],
  },
  hi: {
    summary:
      "नमस्ते! मैं भारतवॉयस AI हूँ, आपका बहुभाषी सरकारी योजना सहायक। आप 11 भारतीय भाषाओं में बोलकर या लिखकर पूछ सकते हैं। आप छात्रवृत्ति, किसान सम्मान निधि, आयुष्मान भारत स्वास्थ्य कार्ड, मुद्रा ऋण या पेंशन योजनाओं के बारे में पूछ सकते हैं।",
    followups: [
      "छात्रों के लिए छात्रवृत्तियां बताएं",
      "पीएम-किसान सम्मान निधि की जानकारी दें",
      "आयुष्मान भारत कार्ड कैसे बनवाएं?",
    ],
  },
  te: {
    summary:
      "నమస్కారం! నేను భారతవాయిస్ AI, మీ వాయిస్ ఆధారిత ప్రభుత్వ సంక్షేమ సహాయకుడిని. మీరు తెలుగు మరియు 11 భారతీయ భాషలలో మాట్లాడవచ్చు లేదా టైప్ చేయవచ్చు. విద్యార్థుల స్కాలర్‌షిప్‌లు, రైతు భరోసా/పీఎం-కిసాన్, ఆయుష్మాన్ భారత్ లేదా ఉద్యోగ రుణాల గురించి అడగండి.",
    followups: [
      "విద్యార్థులకు ఏ స్కాలర్‌షిప్‌లు ఉన్నాయి?",
      "రైతులకు పీఎం-కిసాన్ వివరాలు చెప్పండి",
      "ఆయుష్మాన్ భారత్ కార్డు ఎలా పొందాలి?",
    ],
  },
  kn: {
    summary:
      "ನಮಸ್ಕಾರ! ನಾನು ಭಾರತವಾಯ್ಸ್ AI, ನಿಮ್ಮ ಧ್ವನಿ ಆಧಾರಿತ ನಾಗರಿಕ ಕಲ್ಯಾಣ ಸಹಾಯಕ. ನೀವು 11 ಭಾರತೀಯ ಭಾಷೆಗಳಲ್ಲಿ ಮಾತನಾಡಬಹುದು ಅಥವಾ ಟೈಪ್ ಮಾಡಬಹುದು. ವಿದ್ಯಾರ್ಥಿವೇತನ, ರೈತ ಯೋಜನೆಗಳು, ಆಯುಷ್ಮಾನ್ ಭಾರತ್ ಆರೋಗ್ಯ ಕಾರ್ಡ್ ಅಥವಾ ಮುದ್ರಾ ಸಾಲದ ಬಗ್ಗೆ ಕೇಳಿ.",
    followups: [
      "ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಯಾವ ವಿದ್ಯಾರ್ಥಿವೇತನಗಳಿವೆ?",
      "ಪಿಎಂ-ಕಿಸಾನ್ ಯೋಜನೆಯ ವಿವರ ಕೊಡಿ",
      "ಆಯುಷ್ಮಾನ್ ಭಾರತ್ ಕಾರ್ಡ್ ಹೇಗೆ ಪಡೆಯುವುದು?",
    ],
  },
  ta: {
    summary:
      "வணக்கம்! நான் பாரத்வாய்ஸ் AI, உங்கள் குரல்வழி அரசு நலத்திட்ட உதவியாளர். நீங்கள் 11 இந்திய மொழிகளில் குரல் மூலமாகவோ அல்லது தட்டச்சு செய்தோ கேட்கலாம். கல்வி உதவித்தொகை, உழவர் திட்டங்கள், ஆயுஷ்மான் பாரத் மற்றும் முத்ரா கடன் பற்றி கேளுங்கள்.",
    followups: [
      "மாணவர்களுக்கான கல்வி உதவித்தொகைகள் என்ன?",
      "விவசாயிகளுக்கான பிஎம்-கிசான் திட்டம் பற்றி சொல்லுங்கள்",
      "ஆயுஷ்மான் பாரத் கார்டு எப்படி பெறுவது?",
    ],
  },
  mr: {
    summary:
      "नमस्कार! मी भारतव्हॉइस AI आहे, तुमचा बहुभाषिक नागरिक सहाय्यक. तुम्ही 11 भारतीय भाषांमध्ये बोलून किंवा लिहून विचारू शकता. शिष्यवृत्ती, शेतकरी योजना, आयुष्यमान भारत किंवा मुद्रा कर्जाबद्दल विचारा.",
    followups: [
      "विद्यार्थ्यांसाठी कोणत्या शिष्यवृत्ती आहेत?",
      "शेतकऱ्यांसाठी पीएम-किसान योजनेची माहिती द्या",
      "आयुष्यमान भारत कार्ड कसे मिळवायचे?",
    ],
  },
  bn: {
    summary:
      "নমস্কার! আমি ভারতভয়েস AI, আপনার বহুভাষিক সরকারি প্রকল্প সহকারী। আপনি ১১টি ভারতীয় ভাষায় কথা বলে বা লিখে প্রশ্ন করতে পারেন। ছাত্রবৃত্তি, কৃষক সহায়তা, আয়ুষ্মান ভারত বা মুদ্রা ঋণ সম্পর্কে জানতে চান?",
    followups: [
      "ছাত্রছাত্রীদের জন্য কী কী স্কলারশিপ আছে?",
      "কৃষকদের পিএম-কিসান প্রকল্প সম্পর্কে বলুন",
      "আয়ুষ্মান ভারত কার্ড কীভাবে পাবেন?",
    ],
  },
  gu: {
    summary:
      "નમસ્તે! હું ભારતવોઇસ AI છું, તમારો અવાજ-આધારિત સરકારી સહાયક. તમે 11 ભારતીય ભાષાઓમાં બોલીને અથવા ટાઇપ કરીને પ્રશ્ન પૂછી શકો છો. વિદ્યાર્થી સ્કોલરશિપ, પીએમ-કિસાન, આયુષ્માન ભારત અથવા મુદ્રા લોન વિશે પૂછો.",
    followups: [
      "વિદ્યાર્થીઓ માટે કઈ સ્કોલરશિપ છે?",
      "ખેડૂતો માટે પીએમ-કિસાન વિશે જણાવો",
      "આયુષ્માન ભારત કાર્ડ કેવી રીતે બનાવવું?",
    ],
  },
  ml: {
    summary:
      "നമസ്കാരം! ഞാൻ ഭാരത്വോയ്സ് AI ആണ്. 11 ഇന്ത്യൻ ഭാഷകളിൽ സംസാരിക്കാനും ടൈപ്പ് ചെയ്യാനും കഴിയും. സ്കോളർഷിപ്പുകൾ, കർഷക പദ്ധതികൾ, ആയുഷ്മാൻ ഭാരത്, മുദ്ര വായ്പ എന്നിവയെക്കുറിച്ച് ചോദിക്കാം.",
    followups: [
      "വിദ്യാർത്ഥികൾക്കുള്ള സ്കോളർഷിപ്പുകൾ ഏതെല്ലാം?",
      "പിഎം-കിസാൻ പദ്ധതിയെക്കുറിച്ച് പറയൂ",
      "ആയുഷ്മാൻ ഭാരത് കാർഡ് എങ്ങനെ ലഭിക്കും?",
    ],
  },
  pa: {
    summary:
      "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਭਾਰਤਵਾਇਸ AI ਹਾਂ। ਤੁਸੀਂ 11 ਭਾਰਤੀ ਭਾਸ਼ਾਵਾਂ ਵਿੱਚ ਬੋਲ ਕੇ ਜਾਂ ਲਿਖ ਕੇ ਪੁੱਛ ਸਕਦੇ ਹੋ। ਵਜ਼ੀਫ਼ੇ, ਕਿਸਾਨ ਸਕੀਮਾਂ, ਆਯੂਸ਼ਮਾਨ ਭਾਰਤ ਜਾਂ ਮੁਦਰਾ ਕਰਜ਼ੇ ਬਾਰੇ ਜਾਣਕਾਰੀ ਲਵੋ।",
    followups: [
      "ਵਿਦਿਆਰਥੀਆਂ ਲਈ ਕਿਹੜੇ ਵਜ਼ੀਫ਼ੇ ਹਨ?",
      "ਪੀਐਮ-ਕਿਸਾਨ ਸਕੀਮ ਬਾਰੇ ਦੱਸੋ",
      "ਆਯੂਸ਼ਮਾਨ ਭਾਰਤ ਕਾਰਡ ਕਿਵੇਂ ਬਣਾਈਏ?",
    ],
  },
  or: {
    summary:
      "ନମସ୍କାର! ମୁଁ ଭାରତଭଏସ୍ AI। ଆପଣ 11ଟି ଭାରତୀୟ ଭାଷାରେ କହି କିମ୍ବା ଟାଇପ୍ କରି ପଚାରିପାରିବେ। ଛାତ୍ରବୃତ୍ତି, କୃଷକ ଯୋଜନା, ଆୟୁଷ୍ମାନ ଭାରତ କିମ୍ବା ମୁଦ୍ରା ଋଣ ବିଷୟରେ ପଚାରନ୍ତୁ।",
    followups: [
      "ଛାତ୍ରଛାତ୍ରୀଙ୍କ ପାଇଁ କେଉଁ ସ୍କଲାରସିପ୍ ଅଛି?",
      "କୃଷକଙ୍କ ପାଇଁ ପିଏମ୍-କିଷାନ ବିଷୟରେ କୁହନ୍ତୁ",
      "ଆୟୁଷ୍ମାନ ଭାରତ କାର୍ଡ କିପରି କରିବେ?",
    ],
  },
};

const LANGUAGE_RESPONSES: Record<Language, { title: string; summary: string; supported: string[]; followups: string[] }> = {
  en: {
    title: "BharathVoice AI - Supported Indian Languages",
    summary: "BharathVoice AI supports 11 Indian languages with high-accuracy speech recognition, audio voice responses, and official scheme information: 1. English, 2. हिन्दी (Hindi), 3. తెలుగు (Telugu), 4. ಕನ್ನಡ (Kannada), 5. தமிழ் (Tamil), 6. मराठी (Marathi), 7. বাংলা (Bengali), 8. ગુજરાતી (Gujarati), 9. മലയാളം (Malayalam), 10. ਪੰਜਾਬੀ (Punjabi), and 11. ଓଡ଼ିଆ (Odia). You can speak or write queries in any of these languages.",
    supported: [
      "1. English (India)",
      "2. हिन्दी (Hindi)",
      "3. తెలుగు (Telugu)",
      "4. ಕನ್ನಡ (Kannada)",
      "5. தமிழ் (Tamil)",
      "6. मराठी (Marathi)",
      "7. বাংলা (Bengali)",
      "8. ગુજરાતી (Gujarati)",
      "9. മലയാളം (Malayalam)",
      "10. ਪੰਜਾਬੀ (Punjabi)",
      "11. ଓଡ଼ିଆ (Odia)",
    ],
    followups: [
      "Tell me about PM-KISAN in Telugu",
      "What scholarships are available for students?",
      "How to apply for Ayushman Bharat health card?",
    ],
  },
  te: {
    title: "భారతవాయిస్ AI - మద్దతు ఇచ్చే 11 భారతీయ భాషలు",
    summary: "భారతవాయిస్ AI మొత్తం 11 భారతీయ భాషలకు పూర్తి వాయిస్ గుర్తింపు, ఆడియో స్పీచ్ మరియు పథకాల సమాచారంతో మద్దతు ఇస్తుంది: 1. తెలుగు (Telugu), 2. ఇంగ్లీష్ (English), 3. హిందీ (Hindi), 4. కన్నడ (Kannada), 5. తమిళం (Tamil), 6. మరాఠీ (Marathi), 7. బెంగాలీ (Bengali), 8. గుజరాతీ (Gujarati), 9. మలయాళం (Malayalam), 10. పంజాబీ (Punjabi), 11. ఒడియా (Odia). మీరు వీటిలో మీకు నచ్చిన భాషలో మాట్లాడవచ్చు లేదా టైప్ చేయవచ్చు.",
    supported: [
      "1. తెలుగు (Telugu)",
      "2. English (ఇంగ్లీష్)",
      "3. हिन्दी (హిందీ)",
      "4. ಕನ್ನಡ (కన్నడ)",
      "5. தமிழ் (తమిళం)",
      "6. मराठी (మరాఠీ)",
      "7. বাংলা (బెంగాలీ)",
      "8. ગુજરાતી (గుజరాతీ)",
      "9. മലയാളം (మలయాళం)",
      "10. ਪੰਜਾਬੀ (పంజాబీ)",
      "11. ଓଡ଼ିଆ (ఒడియా)",
    ],
    followups: [
      "రైతులకు పీఎం-కిసాన్ వివరాలు చెప్పండి",
      "విద్యార్థుల స్కాలర్‌షిప్‌ల వివరాలు తెలపండి",
      "ఆయుష్మాన్ భారత్ హెల్త్ కార్డు ఎలా పొందాలి?",
    ],
  },
  hi: {
    title: "भारतवॉयस AI - 11 समर्थित भारतीय भाषाएं",
    summary: "भारतवॉयस AI 11 भारतीय भाषाओं में प्राकृतिक वॉइस इनपुट, ऑडियो उत्तर और सरकारी योजनाओं की जानकारी का समर्थन करता है: 1. हिन्दी (Hindi), 2. अंग्रेज़ी (English), 3. तेलुगु (Telugu), 4. कन्नड़ (Kannada), 5. तमिल (Tamil), 6. मराठी (Marathi), 7. बंगाली (Bengali), 8. गुजराती (Gujarati), 9. मलयालम (Malayalam), 10. पंजाबी (Punjabi) और 11. ओडिया (Odia)। आप इनमें से किसी भी भाषा में बोलकर या लिखकर प्रश्न पूछ सकते हैं।",
    supported: [
      "1. हिन्दी (Hindi)",
      "2. English (अंग्रेज़ी)",
      "3. తెలుగు (तेलुगु)",
      "4. ಕನ್ನಡ (कन्नड़)",
      "5. தமிழ் (तमिल)",
      "6. मराठी (मराठी)",
      "7. বাংলা (बंगाली)",
      "8. ગુજરાતી (गुजराती)",
      "9. മലയാളം (मलयालम)",
      "10. ਪੰਜਾਬੀ (पंजाबी)",
      "11. ଓଡ଼ିଆ (ओडिया)",
    ],
    followups: [
      "पीएम-किसान योजना की जानकारी दें",
      "विद्यार्थियों के लिए छात्रवृत्तियां बताएं",
      "आयुष्मान भारत कार्ड कैसे बनवाएं?",
    ],
  },
  kn: {
    title: "ಭಾರತವಾಯ್ಸ್ AI - 11 ಬೆಂಬಲಿತ ಭಾರತೀಯ ಭಾಷೆಗಳು",
    summary: "ಭಾರತವಾಯ್ಸ್ AI 11 ಭಾರತೀಯ ಭಾಷೆಗಳಲ್ಲಿ ಧ್ವನಿ ಮತ್ತು ಯೋಜನೆಗಳ ಮಾಹಿತಿಯನ್ನು ಬೆಂಬಲಿಸುತ್ತದೆ: 1. ಕನ್ನಡ (Kannada), 2. ಇಂಗ್ಲಿಷ್ (English), 3. ಹಿಂದಿ (Hindi), 4. ತೆಲುಗು (Telugu), 5. ತಮಿಳು (Tamil), 6. ಮರಾಠಿ (Marathi), 7. ಬೆಂಗಾಲಿ (Bengali), 8. ಗುಜರಾತಿ (Gujarati), 9. ಮಲಯಾಳಂ (Malayalam), 10. ಪಂಜಾಬಿ (Punjabi), 11. ಒಡಿಯಾ (Odia).",
    supported: [
      "1. ಕನ್ನಡ (Kannada)",
      "2. English (ಇಂಗ್ಲಿಷ್)",
      "3. हिन्दी (ಹಿಂದಿ)",
      "4. తెలుగు (ತೆಲುಗು)",
      "5. தமிழ் (ತಮಿಳು)",
      "6. मराठी (ಮರಾಠಿ)",
      "7. বাংলা (ಬೆಂಗಾಲಿ)",
      "8. ગુજરાતી (ಗುಜರಾತಿ)",
      "9. മലയാളം (ಮಲಯಾಳಂ)",
      "10. ਪੰਜਾਬੀ (ਪੰਜਾਬੀ)",
      "11. ଓଡ଼ିଆ (ಒಡಿಯಾ)",
    ],
    followups: [
      "ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಯಾವ ವಿದ್ಯಾರ್ಥಿವೇತನಗಳಿವೆ?",
      "ಪಿಎಂ-ಕಿಸಾನ್ ಯೋಜನೆಯ ವಿವರ ಕೊಡಿ",
      "ಆಯುಷ್ಮಾನ್ ಭಾರತ್ ಕಾರ್ಡ್ ಹೇಗೆ ಪಡೆಯುವುದು?",
    ],
  },
  ta: {
    title: "பாரத்வாய்ஸ் AI - 11 இந்திய மொழிகள் ஆதரவு",
    summary: "பாரத்வாய்ಸ್ AI 11 இந்திய மொழிகளில் முழு குரல் ஆதரவு மற்றும் அரசு திட்ட வழிகாட்டலை வழங்குகிறது: 1. தமிழ் (Tamil), 2. ஆங்கிலம் (English), 3. இந்தி (Hindi), 4. தெலுங்கு (Telugu), 5. கன்னடம் (Kannada), 6. மராத்தி (Marathi), 7. பெங்காலி (Bengali), 8. குஜராத்தி (Gujarati), 9. மலையாளம் (Malayalam), 10. பஞ்சாபி (Punjabi), 11. ஒடியா (Odia). நீங்கள் எந்த மொழியிலும் பேசலாம் அல்லது தட்டச்சு செய்யலாம்.",
    supported: [
      "1. தமிழ் (Tamil)",
      "2. English (ஆங்கிலம்)",
      "3. हिन्दी (இந்தி)",
      "4. తెలుగు (தெலுங்கு)",
      "5. ಕನ್ನಡ (கன்னடம்)",
      "6. मराठी (மராத்தி)",
      "7. বাংলা (பெங்காலி)",
      "8. ગુજરાતી (குஜராத்தி)",
      "9. മലയാളം (மலையாளம்)",
      "10. ਪੰਜਾਬੀ (பஞ்சாபி)",
      "11. ଓଡ଼ିଆ (ஒடியா)",
    ],
    followups: [
      "மாணவர்களுக்கான கல்வி உதவித்தொகைகள் என்ன?",
      "விவசாயிகளுக்கான பிஎம்-கிசான் திட்டம் பற்றி சொல்லுங்கள்",
      "ஆயுஷ்மான் பாரத் கார்டு எப்படி பெறுவது?",
    ],
  },
  mr: {
    title: "भारतव्हॉइस AI - 11 समर्थित भारतीय भाषा",
    summary: "भारतव्हॉइस AI 11 भारतीय भाषांमध्ये व्हॉइस आणि सरकारी योजना माहिती प्रदान करते: 1. मराठी (Marathi), 2. इंग्रजी (English), 3. हिंदी (Hindi), 4. तेलुगू (Telugu), 5. कन्नड (Kannada), 6. तमिळ (Tamil), 7. बंगाली (Bengali), 8. गुजराती (Gujarati), 9. मल्याळम (Malayalam), 10. पंजाबी (Punjabi), 11. ओडिया (Odia). आपण कोणत्याही भाषेत बोलू शकता.",
    supported: [
      "1. मराठी (Marathi)",
      "2. English (इंग्रजी)",
      "3. हिन्दी (हिंदी)",
      "4. తెలుగు (तेलुगू)",
      "5. ಕನ್ನಡ (कन्नड)",
      "6. தமிழ் (तमिळ)",
      "7. বাংলা (बंगाली)",
      "8. ગુજરાતી (गुजराती)",
      "9. മലയാളം (मल्याळम)",
      "10. ਪੰਜਾਬੀ (पंजाबी)",
      "11. ଓଡ଼ିଆ (ओडिया)",
    ],
    followups: [
      "विद्यार्थ्यांसाठी कोणत्या शिष्यवृत्ती आहेत?",
      "शेतकऱ्यांसाठी पीएम-किसान योजनेची माहिती द्या",
      "आयुष्यमान भारत कार्ड कसे मिळवायचे?",
    ],
  },
  bn: {
    title: "ভারতভয়েস AI - ১১টি সমর্থিত ভারতীয় ভাষা",
    summary: "ভারতভয়েস AI ১১টি ভারতীয় ভাষায় ভয়েস ও সরকারি প্রকল্পের তথ্য সমর্থন করে: ১. বাংলা (Bengali), ২. ইংরেজি (English), ৩. হিন্দি (Hindi), ৪. তেলুগু (Telugu), ৫. কন্নড় (Kannada), ৬. তামিল (Tamil), ৭. মারাঠি (Marathi), ৮. গুজরাতি (Gujarati), ৯. মালয়ালম (Malayalam), ১০. পাঞ্জাবি (Punjabi), ১১. ওড়িয়া (Odia)। আপনি যেকোনো ভাষায় কথা বলতে পারেন।",
    supported: [
      "১. বাংলা (Bengali)",
      "২. English (ইংরেজি)",
      "৩. हिन्दी (হিন্দি)",
      "৪. తెలుగు (তেলুগু)",
      "৫. ಕನ್ನಡ (কন্নড়)",
      "৬. தமிழ் (তামিল)",
      "৭. मराठी (মারাঠি)",
      "৮. ગુજરાતી (ગુજરાતી)",
      "৯. മലയാളം (মালয়ালম)",
      "১০. ਪੰਜਾਬੀ (পাঞ্জাবি)",
      "১১. ଓଡ଼ିଆ (ওড়িয়া)",
    ],
    followups: [
      "ছাত্রছাত্রীদের জন্য কী কী স্কলারশিপ আছে?",
      "কৃষকদের পিএম-কিসান প্রকল্প সম্পর্কে বলুন",
      "আয়ুষ্মান ভারত কার্ড কীভাবে পাবেন?",
    ],
  },
  gu: {
    title: "ભારતવોઇસ AI - 11 સમર્થિત ભારતીય ભાષાઓ",
    summary: "ભારતવોઇસ AI 11 ભારતીય ભાષાઓમાં વૉઇસ અને સરકારી યોજનાઓની માહિતી આપે છે: 1. ગુજરાતી (Gujarati), 2. અંગ્રેજી (English), 3. હિન્દી (Hindi), 4. તેલુગુ (Telugu), 5. કન્નડ (Kannada), 6. તમિલ (Tamil), 7. મરાઠી (Marathi), 8. બંગાળી (Bengali), 9. મલયાલમ (Malayalam), 10. પંજાબી (Punjabi), 11. ઓડિયા (Odia). તમે આમાંથી કોઈપણ ભાષામાં પૂછી શકો છો.",
    supported: [
      "1. ગુજરાતી (Gujarati)",
      "2. English (અંગ્રેજી)",
      "3. हिन्दी (હિન્દી)",
      "4. తెలుగు (તેલુગુ)",
      "5. ಕನ್ನಡ (કન્નડ)",
      "6. தமிழ் (તમિલ)",
      "7. मराठी (મરાઠી)",
      "8. বাংলা (બંગાળી)",
      "9. മലയാളം (મલયાલમ)",
      "10. ਪੰਜਾਬੀ (ਪੰਜਾਬੀ)",
      "11. ଓଡ଼ିଆ (ઓડિયા)",
    ],
    followups: [
      "વિદ્યાર્થીઓ માટે કઈ સ્કોલરશિપ છે?",
      "ખેડૂતો માટે પીએમ-કિસાન વિશે જણાવો",
      "આયુષ્માન ભારત કાર્ડ કેવી રીતે બનાવવું?",
    ],
  },
  ml: {
    title: "ഭാരത്വോയ്സ് AI - 11 പിന്തുണയ്ക്കുന്ന ഇന്ത്യൻ ഭാഷകൾ",
    summary: "ഭാരത്വോയ്സ് AI 11 ഇന്ത്യൻ ഭാഷകളിൽ വോയ്സ് സേവനവും സർക്കാർ പദ്ധതി വിവരങ്ങളും നൽകുന്നു: 1. മലയാളം (Malayalam), 2. ഇംഗ്ലീഷ് (English), 3. ഹിന്ദി (Hindi), 4. തെലുങ്ക് (Telugu), 5. കന്നഡ (Kannada), 6. തമിഴ് (Tamil), 7. മറാത്തി (Marathi), 8. ബംഗാളി (Bengali), 9. ഗുജറാത്തി (Gujarati), 10. പഞ്ചാബി (Punjabi), 11. ഒഡിയ (Odia).",
    supported: [
      "1. മലയാളം (Malayalam)",
      "2. English (ഇംഗ്ലീഷ്)",
      "3. हिन्दी (ഹിന്ദി)",
      "4. తెలుగు (തെലുങ്ക്)",
      "5. ಕನ್ನಡ (കന്നഡ)",
      "6. தமிழ் (തമിഴ്)",
      "7. मराठी (മરાഠੀ)",
      "8. বাংলা (ബംഗാളി)",
      "9. ગુજરાતી (ഗുജറാത്തി)",
      "10. ਪੰਜਾਬੀ (ਪੰਜਾਬੀ)",
      "11. ଓଡ଼ିଆ (ഒഡിയ)",
    ],
    followups: [
      "വിദ്യാർത്ഥികൾക്കുള്ള സ്കോളർഷിപ്പുകൾ ഏതെല്ലാം?",
      "പിഎം-കിസാൻ പദ്ധതിയെക്കുറിച്ച് പറയൂ",
      "ആയുഷ്മാൻ ഭാരത് കാർഡ് എങ്ങനെ ലഭിക്കും?",
    ],
  },
  pa: {
    title: "ਭਾਰਤਵਾਇਸ AI - 11 ਸਮਰਥਿਤ ਭਾਰਤੀ ਭਾਸ਼ਾਵਾਂ",
    summary: "ਭਾਰਤਵਾਇਸ AI 11 ਭਾਰਤੀ ਭਾਸ਼ਾਵਾਂ ਵਿੱਚ ਆਵਾਜ਼ ਅਤੇ ਸਰਕਾਰੀ ਸਕੀਮਾਂ ਦੀ ਜਾਣਕਾਰੀ ਦਿੰਦਾ ਹੈ: 1. ਪੰਜਾਬੀ (Punjabi), 2. ਅੰਗਰੇਜ਼ੀ (English), 3. ਹਿੰਦੀ (Hindi), 4. ਤੇਲਗੂ (Telugu), 5. ਕੰਨੜ (Kannada), 6. ਤਮਿਲ (Tamil), 7. ਮਰਾਠੀ (Marathi), 8. ਬੰਗਾਲੀ (Bengali), 9. ਗੁਜਰਾਤੀ (Gujarati), 10. ਮਲਿਆਲਮ (Malayalam), 11. ਉੜੀਆ (Odia)।",
    supported: [
      "1. ਪੰਜਾਬੀ (Punjabi)",
      "2. English (ਅੰਗਰੇਜ਼ੀ)",
      "3. हिन्दी (ਹਿੰਦੀ)",
      "4. తెలుగు (ਤੇਲਗੂ)",
      "5. ಕನ್ನಡ (ਕੰਨੜ)",
      "6. தமிழ் (ਤਮਿਲ)",
      "7. मराठी (ਮਰਾਠੀ)",
      "8. বাংলা (ਬੰਗਾਲੀ)",
      "9. ગુજરાਤੀ (ਗੁਜਰਾਤੀ)",
      "10. മലയാളਮ (ਮਲਿਆਲਮ)",
      "11. ଓଡ଼ିଆ (ਉੜੀਆ)",
    ],
    followups: [
      "ਵਿਦਿਆਰਥੀਆਂ ਲਈ ਕਿਹੜੇ ਵਜ਼ੀਫ਼ੇ ਹਨ?",
      "ਪੀਐਮ-ਕਿਸਾਨ ਸਕੀਮ ਬਾਰੇ ਦੱਸੋ",
      "ਆਯੂਸ਼ਮਾਨ ਭਾਰਤ ਕਾਰਡ ਕਿਵੇਂ ਬਣਾਈਏ?",
    ],
  },
  or: {
    title: "ଭାରତଭଏସ୍ AI - 11ଟି ସମର୍ଥିତ ଭାରତୀୟ ଭାଷା",
    summary: "ଭାରତଭଏସ୍ AI 11ଟି ଭାରତୀୟ ଭାଷାରେ ଭଏସ୍ ଏବଂ ସରକାରୀ ଯୋଜନା ସହାୟତା ପ୍ରଦାନ କରେ: 1. ଓଡ଼ିଆ (Odia), 2. ଇଂରାଜୀ (English), 3. ହିନ୍ଦୀ (Hindi), 4. ତେଲୁଗୁ (Telugu), 5. କନ୍ନଡ଼ (Kannada), 6. ତାମିଲ (Tamil), 7. ମରାଠୀ (Marathi), 8. ବଙ୍ଗାଳୀ (Bengali), 9. ଗୁଜରାଟୀ (Gujarati), 10. ମାଲାୟାଲମ୍ (Malayalam), 11. ପଞ୍ଜାବୀ (Punjabi)।",
    supported: [
      "1. ଓଡ଼ିଆ (Odia)",
      "2. English (ଇଂରାଜୀ)",
      "3. हिन्दी (ହିନ୍ଦୀ)",
      "4. తెలుగు (ତେଲୁଗୁ)",
      "5. ಕನ್ನಡ (କନ୍ନଡ଼)",
      "6. தமிழ் (ତାମିଲ)",
      "7. मराठी (ମରାଠୀ)",
      "8. বাংলা (ବଙ୍ଗାଳୀ)",
      "9. ગુજરાતી (ଗୁଜରାଟୀ)",
      "10. മലയാളം (ମାଲାୟାଲମ୍)",
      "11. ପଞ୍ਜାବୀ (ପଞ୍ଜାବୀ)",
    ],
    followups: [
      "ଛାତ୍ରଛାତ୍ରୀଙ୍କ ପାଇଁ କେଉଁ ସ୍କଲାରସିପ୍ ଅଛି?",
      "କୃଷକଙ୍କ ପାଇଁ ପିଏମ୍-କିଷାନ ବିଷୟରେ କୁହନ୍ତୁ",
      "ଆୟୁଷ୍ମାନ ଭାରତ କାର୍ଡ କିପରି କରିବେ?",
    ],
  },
};

const ABOUT_RESPONSES: Record<Language, { title: string; summary: string; capabilities: string[]; followups: string[] }> = {
  en: {
    title: "About BharathVoice AI Citizen Platform",
    summary: "BharathVoice AI is an intelligent, voice-first public welfare assistant built to make Indian government schemes accessible to every citizen. It supports 11 Indian languages, real-time speech recognition, verified guidance from official portals, eligibility verification, step-by-step application walkthroughs, and required document checklists.",
    capabilities: [
      "Voice & Text Search in 11 Indian Languages",
      "Instant Eligibility & Subsidy Calculations",
      "Step-by-step Application & Document Checklists",
      "Verified Data from Official Central & State Portals",
      "Natural Speech Audio Playback",
    ],
    followups: [
      "What Indian languages are supported?",
      "Show all available government schemes",
      "Tell me about PM-KISAN for farmers",
    ],
  },
  te: {
    title: "భారతవాయిస్ AI గురించి",
    summary: "భారతవాయిస్ AI అనేది భారత ప్రభుత్వ సంక్షేమ పథకాలను ప్రతి పౌరుడికి సులభంగా చేరవేయడానికి రూపొందించబడిన ఆధునిక వాయిస్ అసిస్టెంట్. ఇది 11 భారతీయ భాషలలో వాయిస్ ప్రశ్నలను అర్థం చేసుకుంటుంది, అర్హతలు, ప్రయోజనాలు, కావలసిన పత్రాలు మరియు దరఖాస్తు చేసుకునే విధానాన్ని స్పష్టంగా తెలియజేస్తుంది.",
    capabilities: [
      "11 భారతీయ భాషలలో వాయిస్ మరియు టెక్స్ట్ సెర్చ్",
      "పథకాల అర్హత మరియు ప్రయోజనాల లెక్కింపు",
      "దశలవారీగా దరఖాస్తు విధానం మరియు కావలసిన పత్రాల జాబితా",
      "అధికారిక ప్రభుత్వ పోర్టల్స్ నుండి ధ్రువీకరించబడిన సమాచారం",
      "సహజమైన వాయిస్ ఆడియో ప్లేబ్యాక్",
    ],
    followups: [
      "ఏయే భారతీయ భాషలు ఉన్నాయి?",
      "అన్ని ప్రభుత్వ పథకాల జాబితా చూపించండి",
      "రైతులకు పీఎం-కిసాన్ వివరాలు చెప్పండి",
    ],
  },
  hi: {
    title: "भारतवॉयस AI के बारे में",
    summary: "भारतवॉयस AI एक वॉइस-फर्स्ट नागरिक कल्याण सहायक है जो भारतीय सरकारी योजनाओं को हर नागरिक तक पहुंचाने के लिए बनाया गया है। यह 11 भारतीय भाषाओं में बोलकर या लिखकर पूछे गए सवालों के सटीक उत्तर, पात्रता शर्तें और आवेदन प्रक्रिया प्रदान करता है।",
    capabilities: [
      "11 भारतीय भाषाओं में वॉइस और टेक्स्ट सर्च",
      "योजनाओं की पात्रता और लाभों की तुरंत जांच",
      "चरणबद्ध आवेदन प्रक्रिया और आवश्यक दस्तावेज़ों की सूची",
      "आधिकारिक सरकारी पोर्टलों से सत्यापित जानकारी",
      "प्राकृतिक ऑडियो वॉइस प्लेबैक",
    ],
    followups: [
      "कौन-सी भाषाएं उपलब्ध हैं?",
      "सभी सरकारी योजनाओं की सूची दिखाएं",
      "पीएम-किसान योजना की जानकारी दें",
    ],
  },
  kn: {
    title: "ಭಾರತವಾಯ್ಸ್ AI ಬಗ್ಗೆ",
    summary: "ಭಾರತವಾಯ್ಸ್ AI ಒಂದು ಧ್ವನಿ ಆಧಾರಿತ ನಾಗರಿಕ ಕಲ್ಯಾಣ ಸಹಾಯಕವಾಗಿದ್ದು, 11 ಭಾರತೀಯ ಭಾಷೆಗಳಲ್ಲಿ ಸರಕಾರಿ ಯೋಜನೆಗಳ ಮಾಹಿತಿ, ಅರ್ಹತೆ ಮತ್ತು ಅರ್ಜಿ ಸಲ್ಲಿಸುವ ವಿಧಾನವನ್ನು ಒದಗಿಸುತ್ತದೆ.",
    capabilities: [
      "11 ಭಾರತೀಯ ಭಾಷೆಗಳಲ್ಲಿ ಧ್ವನಿ ಹುಡುಕಾಟ",
      "ಅರ್ಹತೆ ಮತ್ತು ಸೌಲಭ್ಯಗಳ ಪರಿಶೀಲನೆ",
      "ಅಗತ್ಯ ದಾಖಲೆಗಳ ಪರಿಶೀಲನಾ ಪಟ್ಟಿ",
      "ಅಧಿಕೃತ ಸರಕಾರಿ ಮಾಹಿತಿಗಳು",
    ],
    followups: ["ಯಾವ ಭಾಷೆಗಳು ಬೆಂಬಲಿತವಾಗಿವೆ?", "ಎಲ್ಲಾ ಯೋಜನೆಗಳ ಪಟ್ಟಿ ತೋರಿಸಿ", "ರೈತರ ಯೋಜನೆಗಳು ಯಾವುವು?"],
  },
  ta: {
    title: "பாரத்வாய்ஸ் AI பற்றி",
    summary: "பாரத்வாய்ஸ் AI என்பது இந்திய அரசின் நலத்திட்டங்களை அனைத்து குடிமக்களுக்கும் எளிதாக கொண்டு சேர்க்கும் குரல்வழி உதவியாளர் ஆகும். இது 11 இந்திய மொழிகளில் செயல்படுகிறது.",
    capabilities: [
      "11 இந்திய மொழிகளில் குரல் மற்றும் உரைத் தேடல்",
      "தகுதி மற்றும் பலன்கள் சரிபார்ப்பு",
      "தேவையான ஆவணங்களின் பட்டியல்",
      "அரசு இணையதளங்களின் அதிகாரப்பூர்வ தகவல்கள்",
    ],
    followups: ["எந்தெந்த மொழிகள் உள்ளன?", "அனைத்து திட்டங்களின் பட்டியல்", "உழவர் திட்டங்கள் என்ன?"],
  },
  mr: {
    title: "भारतव्हॉइस AI बद्दल",
    summary: "भारतव्हॉइस AI हे नागरिकांसाठी एक व्हॉइस-आधारित सरकारी योजना सहाय्यक आहे जे 11 भारतीय भाषांमध्ये अचूक माहिती देते.",
    capabilities: [
      "11 भारतीय भाषांमध्ये व्हॉइस शोध",
      "पात्रता आणि लाभ तपासणी",
      "कागदपत्रांची यादी आणि अर्ज पद्धत",
      "अधिकृत सरकारी माहिती",
    ],
    followups: ["कोणत्या भाषा उपलब्ध आहेत?", "सर्व योजनांची यादी दाखवा", "शेतकरी योजना कोणत्या आहेत?"],
  },
  bn: {
    title: "ভারতভয়েস AI সম্পর্কে",
    summary: "ভারতভয়েস AI হলো একটি ভয়েস-ফার্স্ট নাগরিক কল্যাণ সহকারী যা ১১টি ভারতীয় ভাষায় সরকারি প্রকল্পের সঠিক তথ্য প্রদান করে।",
    capabilities: [
      "১১টি ভারতীয় ভাষায় ভয়েস ও টেক্সট অনুসন্ধান",
      "যোগ্যতা ও সুবিধার হিসাব",
      "প্রয়োজনীয় নথিপত্র ও আবেদন নির্দেশিকা",
      "অফিসিয়াল সরকারি তথ্য",
    ],
    followups: ["কোন কোন ভাষা সমর্থিত?", "সব প্রকল্পের তালিকা দেখান", "কৃষকদের জন্য প্রকল্প কি?"],
  },
  gu: {
    title: "ભારતવોઇસ AI વિશે",
    summary: "ભારતવોઇસ AI એક વૉઇસ-આધારિત સરકારી યોજના સહાયક છે જે 11 ભારતીય ભાષાઓમાં ચોક્કસ માહિતી આપે છે.",
    capabilities: [
      "11 ભારતીય ભાષાઓમાં વૉઇસ સર્ચ",
      "પાત્રતા અને લાભોની વિગતો",
      "જરૂરી દસ્તાવેજો અને અરજી પ્રક્રિયા",
      "સત્તાવાર સરકારી માહિતી",
    ],
    followups: ["કઈ ભાષાઓ ઉપલબ્ધ છે?", "બધી યોજનાઓની યાદી બતાવો", "ખેડૂતો માટે યોજનાઓ કઈ છે?"],
  },
  ml: {
    title: "ഭാരത്വോയ്സ് AI-യെക്കുറിച്ച്",
    summary: "ഭാരത്വോയ്സ് AI എന്നത് 11 ഇന്ത്യൻ ഭാഷകളിൽ സർക്കാർ പദ്ധതികളുടെ കൃത്യമായ വിവരങ്ങൾ നൽകുന്ന വോയ്സ് അസിസ്റ്റന്റാണ്.",
    capabilities: [
      "11 ഇന്ത്യൻ ഭാഷകളിൽ വോയ്സ് തിരച്ചിൽ",
      "അർഹതയും ആനുകൂല്യങ്ങളും പരിശോധിക്കൽ",
      "ആവശ്യമായ രേഖകളുടെ പട്ടിക",
      "ഔദ്യോഗിക സർക്കാർ വിവരങ്ങൾ",
    ],
    followups: ["ഏതൊക്കെ ഭാഷകളുണ്ട്?", "എല്ലാ പദ്ധതികളുടെയും ലിസ്റ്റ്", "കർഷകർക്കുള്ള പദ്ധതികൾ ఏவை?"],
  },
  pa: {
    title: "ਭਾਰਤਵਾਇਸ AI ਬਾਰੇ",
    summary: "ਭਾਰਤਵਾਇਸ AI ਇੱਕ ਆਵਾਜ਼-ਅਧਾਰਿਤ ਨਾਗਰਿਕ ਭਲਾਈ ਸਹਾਇਕ ਹੈ ਜੋ 11 ਭਾਰਤੀ ਭਾਸ਼ਾਵਾਂ ਵਿੱਚ ਸਰਕਾਰੀ ਸਕੀਮਾਂ ਦੀ ਸਹੀ ਜਾਣਕਾਰੀ ਦਿੰਦਾ ਹੈ।",
    capabilities: [
      "11 ਭਾਰਤੀ ਭਾਸ਼ਾਵਾਂ ਵਿੱਚ ਆਵਾਜ਼ ਖੋਜ",
      "ਯੋਗਤਾ ਅਤੇ ਲਾਭਾਂ ਦੀ ਜਾਂਚ",
      "ਲੋੜੀਂਦੇ ਦਸਤਾਵੇਜ਼ਾਂ ਦੀ ਸੂਚੀ",
      "ਸਰਕਾਰੀ ਪੋਰਟਲਾਂ ਤੋਂ ਪ੍ਰਮਾਣਿਤ ਜਾਣਕਾਰੀ",
    ],
    followups: ["ਕਿਹੜੀਆਂ ਭਾਸ਼ਾਵਾਂ ਉਪਲਬਧ ਹਨ?", "ਸਾਰੀਆਂ ਸਕੀਮਾਂ ਦੀ ਸੂਚੀ", "ਕਿਸਾਨਾਂ ਲਈ ਸਕੀਮਾਂ"],
  },
  or: {
    title: "ଭାରତଭଏସ୍ AI ବିଷୟରେ",
    summary: "ଭାରତଭଏସ୍ AI ହେଉଛି 11ଟି ଭାରତୀୟ ଭାଷାରେ ସରକାରୀ ଯୋଜନା ସୂଚନା ପ୍ରଦାନ କରୁଥିବା ଏକ ଭଏସ୍ ଆସିଷ୍ଟାଣ୍ଟ।",
    capabilities: [
      "11ଟି ଭାରତୀୟ ଭାଷାରେ ଭଏସ୍ ସର୍ଚ୍ଚ",
      "ଯୋଗ୍ୟତା ଏବଂ ସୁବିଧା ଯାଞ୍ଚ",
      "ଆବଶ୍ୟକ ଦସ୍ତାବିଜ ତାଲିକା",
      "ସରକାରୀ ପୋର୍ଟାଲର ପ୍ରମାଣିତ ତଥ୍ୟ",
    ],
    followups: ["କେଉଁ ଭାଷା ଉପଲବ୍ଧ?", "ସମସ୍ତ ଯୋଜନାର ତାଲିକା", "କୃଷକ ଯୋଜନା ବିଷୟରେ କୁହନ୍ତୁ"],
  },
};

const DIRECTORY_RESPONSES: Record<Language, { title: string; summary: string; categories: string[]; followups: string[] }> = {
  en: {
    title: "Available Government Welfare Schemes Directory",
    summary: "BharathVoice AI covers central and state welfare programs across 6 key sectors: 1. Agriculture (PM-KISAN, PM Fasal Bima), 2. Healthcare (Ayushman Bharat PM-JAY), 3. Scholarships (NMMS, Pragati, Jagananna Vidya Deevena), 4. Employment & Loans (PMEGP, Mudra Loan, PMKVY Skills), 5. Social Security (Old Age Pension IGNOAPS, Sukanya Samriddhi), and 6. Citizen Services (Aadhaar, Caste & Income Certificates).",
    categories: [
      "🌾 Agriculture: PM-KISAN (₹6,000/yr), PM Fasal Bima Yojana (Crop Insurance)",
      "🏥 Healthcare: Ayushman Bharat PM-JAY (₹5 Lakh cashless health cover)",
      "🎓 Education: NMMS (₹12,000/yr), Pragati Scholarship (₹50,000/yr), Vidya Deevena (Full Fee)",
      "💼 Employment & MSME: PMEGP (₹25-50 Lakh subsidy loans), PM Mudra Yojana, PMKVY Training",
      "👵 Social Welfare: IGNOAPS Old Age Pension, Sukanya Samriddhi Yojana",
      "🏛️ Citizen Services: Aadhaar card updates, Meeseva caste & income certificates",
    ],
    followups: [
      "Tell me about PM-KISAN for farmers",
      "How to get Ayushman Bharat health card?",
      "What scholarships are available for girl students?",
    ],
  },
  te: {
    title: "అందుబాటులో ఉన్న ప్రభుత్వ పథకాల జాబితా",
    summary: "భారతవాయిస్ AI 6 ప్రధాన రంగాలలో కేంద్ర మరియు రాష్ట్ర ప్రభుత్వ సంక్షేమ పథకాల సమాచారాన్ని అందిస్తుంది: 1. వ్యవసాయం (పీఎం-కిసాన్, ఫసల్ బీమా), 2. ఆరోగ్యం (ఆయుష్మాన్ భారత్ హెల్త్ కార్డు), 3. స్కాలర్‌షిప్‌లు (ఎన్ఎమ్ఎమ్ఎస్, ప్రగతి, విద్యా దీవెన), 4. ఉపాధి & రుణాలు (పీఎంఈజీపీ, ముద్రా రుణాలు, నైపుణ్య శిక్షణ), 5. సంక్షేమం & పెన్షన్లు (వృద్ధాప్య పింఛను), 6. పౌర సేవలు (ఆధార్, ఆదాయ & కుల ధ్రువీకరణ పత్రాలు).",
    categories: [
      "🌾 వ్యవసాయం: పీఎం-కిసాన్ (ఏటా ₹6,000), ప్రధానమంత్రి ఫసల్ బీమా యోజన",
      "🏥 ఆరోగ్యం: ఆయుష్మాన్ భారత్ పీఎం-జేవై (₹5 లక్షల ఉచిత వైద్యం)",
      "🎓 చదువు & స్కాలర్‌షిప్‌లు: ఎన్ఎమ్ఎమ్ఎస్, ప్రగతి స్కాలర్‌షిప్, జగనన్న విద్యా దీవెన",
      "💼 ఉపాధి & రుణాలు: పీఎంఈజీపీ లోన్లు (₹25-50 లక్షలు), ముద్రా రుణాలు, పీఎంకేవీవై శిక్షణ",
      "👵 సామాజిక సంక్షేమం: జాతీయ వృద్ధాప్య పింఛను, సుకన్య సమృద్ధి యోజన",
      "🏛️ పౌర సేవలు: ఆధార్ కార్డు సేవలు, కుల & ఆదాయ ధ్రువీకరణ పత్రాలు",
    ],
    followups: [
      "రైతులకు పీఎం-కిసాన్ వివరాలు చెప్పండి",
      "ఆయుష్మాన్ భారత్ కార్డు ఎలా పొందాలి?",
      "విద్యార్థుల స్కాలర్‌షిప్‌ల వివరాలు చెప్పండి",
    ],
  },
  hi: {
    title: "सभी उपलब्ध सरकारी योजनाओं की सूची",
    summary: "भारतवॉयस AI 6 प्रमुख क्षेत्रों में केंद्र और राज्य सरकार की योजनाओं की जानकारी प्रदान करता है: 1. कृषि (पीएम-किसान, फसल बीमा), 2. स्वास्थ्य (आयुष्मान भारत योजना), 3. छात्रवृत्तियां (एनएमएमएस, प्रगति छात्रवृत्ति), 4. रोजगार व ऋण (पीएमईजीपी, मुद्रा लोन, कौशल विकास), 5. सामाजिक सुरक्षा (वृद्धावस्था पेंशन), 6. नागरिक सेवाएं (आधार सेवाएं, जाति व आय प्रमाण पत्र)।",
    categories: [
      "🌾 कृषि: पीएम-किसान (₹6,000 प्रति वर्ष), प्रधानमंत्री फसल बीमा योजना",
      "🏥 स्वास्थ्य: आयुष्मान भारत पीएम-जेएवाई (₹5 लाख तक मुफ्त इलाज)",
      "🎓 शिक्षा व छात्रवृत्ति: एनएमएमएस (₹12,000/वर्ष), प्रगति बालिका छात्रवृत्ति, विद्यालक्ष्मी",
      "💼 रोजगार व व्यवसाय ऋण: पीएमईजीपी (₹25-50 लाख लोन), मुद्रा योजना, पीएमकेवीवाई",
      "👵 सामाजिक सुरक्षा: वृद्धावस्था पेंशन योजना, सुकन्या समृद्धि योजना",
      "🏛️ नागरिक सेवाएं: आधार कार्ड सेवाएं, जाति व आय प्रमाण पत्र",
    ],
    followups: [
      "पीएम-किसान योजना की पूरी जानकारी दें",
      "आयुष्मान भारत कार्ड कैसे बनवाएं?",
      "विद्यार्थियों के लिए छात्रवृत्तियां बताएं",
    ],
  },
  kn: {
    title: "ಲಭ್ಯವಿರುವ ಸರಕಾರಿ ಯೋಜನೆಗಳ ಪಟ್ಟಿ",
    summary: "ಭಾರತವಾಯ್ಸ್ AI 6 ಪ್ರಮುಖ ಕ್ಷೇತ್ರಗಳಲ್ಲಿ ಸರಕಾರಿ ಯೋಜನೆಗಳ ಸಮಗ್ರ ಮಾಹಿತಿಯನ್ನು ನೀಡುತ್ತದೆ: ಕೃಷಿ, ಆರೋಗ್ಯ, ವಿದ್ಯಾರ್ಥಿವೇತನ, ಉದ್ಯೋಗ ಮತ್ತು ಸಾಲಗಳು, ಸಾಮಾಜಿಕ ಕಲ್ಯಾಣ ಹಾಗೂ ನಾಗರಿಕ ಸೇವೆಗಳು.",
    categories: [
      "🌾 ಕೃಷಿ: ಪಿಎಂ-ಕಿಸಾನ್, ಪ್ರಧಾನ ಮಂತ್ರಿ ಫಸಲ್ ಬಿಮಾ ಯೋಜನೆ",
      "🏥 ಆರೋಗ್ಯ: ಆಯುಷ್ಮಾನ್ ಭಾರತ್ (₹5 ಲಕ್ಷ ಉಚಿತ ಚಿಕಿತ್ಸೆ)",
      "🎓 ಶಿಕ್ಷಣ: ಎನ್‌ಎಂಎಂಎಸ್, ಪ್ರಗತಿ ವಿದ್ಯಾರ್ಥಿವೇತನ",
      "💼 ಉದ್ಯೋಗ: ಪಿಎಂಇಜಿಪಿ ಸಾಲ, ಮುದ್ರಾ ಸಾಲ ಯೋಜನೆ",
      "👵 ಸಾಮಾಜಿಕ ಕಲ್ಯಾಣ: ವೃದ್ಧಾಪ್ಯ ಪಿಂಚಣಿ",
    ],
    followups: ["ಪಿಎಂ-ಕಿಸಾನ್ ವಿವರ ಕೊಡಿ", "ಆಯುಷ್ಮಾನ್ ಭಾರತ್ ಕಾರ್ಡ್ ಹೇಗೆ?", "ವಿದ್ಯಾರ್ಥಿವೇತನಗಳ ಮಾಹಿತಿ ನೀಡಿ"],
  },
  ta: {
    title: "அனைத்து அரசு நலத்திட்டங்களின் பட்டியல்",
    summary: "பாரத்வாய்ஸ் AI 6 முக்கிய துறைகளில் அரசு திட்டங்களின் தகவல்களை வழங்குகிறது: விவசாயம், சுகாதாரம், கல்வி உதவித்தொகை, வேலைவாய்ப்பு & கடன்கள், சமூக நலம் மற்றும் குடிமக்கள் சேவைகள்.",
    categories: [
      "🌾 விவசாயம்: பிஎம்-கிசான் (ஆண்டுக்கு ₹6,000), பயிர் காப்பீட்டு திட்டம்",
      "🏥 சுகாதாரம்: ஆயுஷ்மான் பாரத் (₹5 லட்சம் மருத்துவ காப்பீடு)",
      "🎓 கல்வி: என்எம்எம்எஸ், பிரகதி உதவித்தொகை",
      "💼 வேலைவாய்ப்பு & கடன்: பிஎம்இஜிபி, முத்ரா கடன் திட்டம்",
      "👵 சமூக நலம்: முதியோர் ஓய்வூதியம்",
    ],
    followups: ["பிஎம்-கிசான் திட்டம் பற்றி சொல்லுங்கள்", "ஆயுஷ்மான் பாரத் கார்டு எப்படி?", "கல்வி உதவித்தொகை விவரம்"],
  },
  mr: {
    title: "सर्व सरकारी योजनांची सूची",
    summary: "भारतव्हॉइस AI 6 मुख्य क्षेत्रांमधील सरकारी योजनांची माहिती देते: शेती, आरोग्य, शिष्यवृत्ती, रोजगार व कर्ज, सामाजिक सुरक्षा आणि नागरिक सेवा.",
    categories: [
      "🌾 शेती: पीएम-किसान (वार्षिक ₹6,000), पीक विमा योजना",
      "🏥 आरोग्य: आयुष्यमान भारत (₹5 लाख मोफत उपचार)",
      "🎓 शिक्षण: एनएमएमएस, प्रगती शिष्यवृत्ती",
      "💼 रोजगार व व्यवसाय: पीएमईजीपी, मुद्रा कर्ज",
      "👵 सामाजिक सुरक्षा: वृद्धापकाळ पेन्शन",
    ],
    followups: ["पीएम-किसान बद्दल सांगा", "आयुष्यमान भारत कार्ड कसे मिळवायचे?", "शिष्यवृत्ती योजना कोणत्या आहेत?"],
  },
  bn: {
    title: "সমস্ত সরকারি প্রকল্পের তালিকা",
    summary: "ভারতভয়েস AI 6টি প্রধান ক্ষেত্রে সরকারি প্রকল্পের তথ্য প্রদান করে: কৃষি, স্বাস্থ্য, স্কলারশিপ, কর্মসংস্থান ও ঋণ, সামাজিক সুরক্ষা এবং নাগরিক পরিষেবা।",
    categories: [
      "🌾 কৃষি: পিএম-কিসান (বছরে ₹6,000), ফসল বিমা যোজনা",
      "🏥 স্বাস্থ্য: আয়ুষ্মান ভারত (₹5 লক্ষ ফ্রি চিকিৎসা)",
      "🎓 শিক্ষা: এনএমএমএস, প্রগতি স্কলারশিপ",
      "💼 কর্মসংস্থান: পিএমইজিপি, মুদ্রা লোন",
      "👵 সামাজিক নিরাপত্তা: বার্ধক্য পেনশন",
    ],
    followups: ["পিএম-কিসান সম্পর্কে বলুন", "আয়ুষ্মান ভারত কার্ড কীভাবে পাবেন?", "ছাত্রবৃত্তির তালিকা দেখান"],
  },
  gu: {
    title: "તમામ સરકારી યોજનાઓની યાદી",
    summary: "ભારતવોઇસ AI 6 મુખ્ય ક્ષેત્રોમાં સરકારી યોજનાઓની માહિતી આપે છે: ખેતી, આરોગ્ય, સ્કોલરશિપ, રોજગાર અને લોન, સામાજિક કલ્યાણ અને નાગરિક સેવાઓ.",
    categories: [
      "🌾 ખેતી: પીએમ-કિસાન (વાર્ષિક ₹6,000), પાક વીમા યોજના",
      "🏥 આરોગ્ય: આયુષ્માન ભારત (₹5 લાખ મફત સારવાર)",
      "🎓 શિક્ષણ: એનએમએમએસ, પ્રગતિ સ્કોલરશિપ",
      "💼 રોજગાર: પીએમઇજીપી, મુદ્રા લોન યોજના",
      "👵 સામાજિક સુરક્ષા: વૃદ્ધ પેન્શન",
    ],
    followups: ["પીએમ-કિસાન વિશે જણાવો", "આયુષ્માન ભારત કાર્ડ કેવી રીતે બનાવવું?", "સ્કોલરશિપ યોજનાઓ"],
  },
  ml: {
    title: "എല്ലാ സർക്കാർ പദ്ധതികളുടെയും ലിസ്റ്റ്",
    summary: "ഭാരത്വോയ്സ് AI 6 പ്രധാന മേഖലകളിലെ സർക്കാർ പദ്ധതികളുടെ വിവരങ്ങൾ നൽകുന്നു: കൃഷി, ആരോഗ്യം, സ്കോളർഷിപ്പ്, തൊഴിൽ & വായ്പകൾ, സാമൂഹിക ക്ഷേമം.",
    categories: [
      "🌾 കൃഷി: പിഎം-കിസാൻ (പ്രതിവർഷം ₹6,000), വിള ഇൻഷുറൻസ്",
      "🏥 ആരോഗ്യം: ആയുഷ്മാൻ ഭാരത് (₹5 ലക്ഷം സൗജന്യ ചികിത്സ)",
      "🎓 വിദ്യാഭ്യാസം: എൻഎംഎംഎസ്, പ്രഗതി സ്കോളർഷിപ്പ്",
      "💼 തൊഴിൽ: പിഎംഇജിപി, മുദ്ര വായ്പ",
      "👵 സാമൂഹിക ക്ഷേമം: വാർദ്ധക്യ പെൻഷൻ",
    ],
    followups: ["പിഎം-കിസാൻ വിവരങ്ങൾ", "ആയുഷ്മാൻ ഭാരത് കാർഡ് എങ്ങനെ?", "സ്കോളർഷിപ്പ് വിവരങ്ങൾ"],
  },
  pa: {
    title: "ਸਾਰੀਆਂ ਸਰਕਾਰੀ ਸਕੀਮਾਂ ਦੀ ਸੂਚੀ",
    summary: "ਭਾਰਤਵਾਇਸ AI 6 ਪ੍ਰਮੁੱਖ ਖੇਤਰਾਂ ਵਿੱਚ ਸਰਕਾਰੀ ਸਕੀਮਾਂ ਦੀ ਜਾਣਕਾਰੀ ਦਿੰਦਾ ਹੈ: ਖੇਤੀਬਾੜੀ, ਸਿਹਤ, ਵਜ਼ੀਫ਼ੇ, ਰੋਜ਼ਗਾਰ ਅਤੇ ਕਰਜ਼ੇ, ਸਮਾਜਿਕ ਸੁਰੱਖਿਆ।",
    categories: [
      "🌾 ਖੇਤੀਬਾੜੀ: ਪੀਐਮ-ਕਿਸਾਨ (ਸਾਲਾਨਾ ₹6,000), ਫਸਲ ਬੀਮਾ",
      "🏥 ਸਿਹਤ: ਆਯੂਸ਼ਮਾਨ ਭਾਰਤ (₹5 ਲੱਖ ਮੁਫ਼ਤ ਇਲਾਜ)",
      "🎓 ਸਿੱਖਿਆ: ਐਨਐਮਐਮਐਸ, ਪ੍ਰਗਤੀ ਸਕਾਲਰਸ਼ਿਪ",
      "💼 ਰੋਜ਼ਗਾਰ: ਪੀਐਮਈਜੀਪੀ, ਮੁਦਰਾ ਕਰਜ਼ਾ",
      "👵 ਸਮਾਜਿਕ ਸੁਰੱਖਿਆ: ਬੁਢਾਪਾ ਪੈਨਸ਼ਨ",
    ],
    followups: ["ਪੀਐਮ-ਕਿਸਾਨ ਸਕੀਮ ਬਾਰੇ ਦੱਸੋ", "ਆਯੂਸ਼ਮਾਨ ਭਾਰਤ ਕਾਰਡ ਕਿਵੇਂ ਬਣਾਈਏ?", "ਵਜ਼ੀਫ਼ੇ ਦੀ ਜਾਣਕਾਰੀ"],
  },
  or: {
    title: "ସମସ୍ତ ସରକାରୀ ଯୋଜନାର ତାଲିକା",
    summary: "ଭାରତଭଏସ୍ AI 6ଟି ପ୍ରମୁଖ କ୍ଷେତ୍ରରେ ସରକାରୀ ଯୋଜନା ସୂଚନା ପ୍ରଦାନ କରେ: କୃଷି, ସ୍ୱାସ୍ଥ୍ୟ, ଛାତ୍ରବୃତ୍ତି, ନିଯୁକ୍ତି ଓ ଋଣ, ସାମାଜିକ ସୁରକ୍ଷା।",
    categories: [
      "🌾 କୃଷି: ପିଏମ୍-କିଷାନ (ବର୍ଷକୁ ₹6,000), ଫସଲ ବୀମା",
      "🏥 ସ୍ୱାସ୍ଥ୍ୟ: ଆୟୁଷ୍ମାନ ଭାରତ (₹5 ଲକ୍ଷ ମାଗଣା ଚିକିତ୍ସା)",
      "🎓 ଶିକ୍ଷା: ଏନ୍ଏମ୍ଏମ୍ଏସ୍, ପ୍ରଗତି ବୃତ୍ତି",
      "💼 ନିଯୁକ୍ତି: ପିଏମ୍ଇଜିପି, ମୁଦ୍ରା ଋଣ",
      "👵 ସାମାଜିକ ସୁରକ୍ଷା: ବୃଦ୍ଧାବସ୍ଥା ପେନସନ",
    ],
    followups: ["ପିଏମ୍-କିଷାନ ବିଷୟରେ କୁହନ୍ତୁ", "ଆୟୁଷ୍ମାନ ଭାରତ କାର୍ଡ କିପରି କରିବେ?", "ଛାତ୍ରବୃତ୍ତି ସୂଚନା"],
  },
};

const NO_SOURCE_MSGS: Record<Language, string> = {
  en: "I could not find an official government scheme matching your specific request. Please specify your state or sector (e.g., scholarships, agriculture, healthcare, employment).",
  hi: "मुझे आपके इस अनुरोध से मेल खाती कोई आधिकारिक सरकारी योजना नहीं मिली। कृपया अपना राज्य, क्षेत्र (जैसे छात्रवृत्ति, कृषि, स्वास्थ्य, रोजगार) बताएं।",
  te: "మీ ప్రశ్నకు సంబంధించిన అధికారిక ప్రభుత్వ పథకం లభించలేదు. దయచేసి మీ రాష్ట్రం, రంగం (ఉదాహరణకు స్కాలర్‌షిప్‌లు, వ్యవసాయం, వైద్యం, ఉద్యోగం) పేర్కొనండి.",
  kn: "ನಿಮ್ಮ ಕೋರಿಕೆಗೆ ಸರಿಹೊಂದುವ ಯಾವುದೇ ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಯೋಜನೆ ಕಂಡುಬಂದಿಲ್ಲ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ರಾಜ್ಯ ಅಥವಾ ಕ್ಷೇತ್ರವನ್ನು (ವಿದ್ಯಾರ್ಥಿವೇತನ, ಕೃಷಿ, ಆರೋಗ್ಯ, ಉದ್ಯೋಗ) ತಿಳಿಸಿ.",
  ta: "உங்கள் கோரிக்கைக்கு ஏற்ற அரசு திட்டம் எதுவும் கிடைக்கவில்லை. உங்கள் மாநிலம் அல்லது துறையை (கல்வி உதவித்தொகை, விவசாயம், மருத்துவம்) குறிப்பிடுங்கள்.",
  mr: "तुमच्या विनंतीशी जुळणारी कोणतीही अधिकृत सरकारी योजना आढळली नाही. कृपया तुमचे राज्य किंवा क्षेत्र (उदा. शिष्यवृत्ती, शेती, आरोग्य, रोजगार) सांगा.",
  bn: "আপনার অনুরোধের সাথে মেলে এমন কোনো সরকারি প্রকল্প পাওয়া যায়নি। অনুগ্রহ করে আপনার রাজ্য বা ক্ষেত্র (যেমন স্কলারশিপ, কৃষি, স্বাস্থ্য) উল্লেখ করুন।",
  gu: "તમારી વિનંતી સાથે મેળ ખાતી કોઈ સત્તાવાર યોજના મળી નથી. કૃપા કરીને તમારું રાજ્ય અથવા ક્ષેત્ર (જેમ કે સ્કોલરશિપ, ખેતી, આરોગ્ય) જણાવો.",
  ml: "നിങ്ങളുടെ ചോദ്യത്തിന് അനുയോജ്യമായ സർക്കാർ പദ്ധതി കണ്ടെത്താനായില്ല. ദയവായി നിങ്ങളുടെ സംസ്ഥാനമോ മേഖലയോ വ്യക്തമാക്കുക.",
  pa: "ਤੁਹਾਡੀ ਬੇਨਤੀ ਨਾਲ ਮੇਲ ਖਾਂਦੀ ਕੋਈ ਸਰਕਾਰੀ ਸਕੀਮ ਨਹੀਂ ਮਿਲੀ। ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਰਾਜ ਜਾਂ ਖੇਤਰ (ਵਜ਼ੀਫ਼ੇ, ਖੇਤੀ, ਸਿਹਤ) ਦੱਸੋ।",
  or: "ଆପଣଙ୍କ ପ୍ରଶ୍ନ ସହ ମେଳ ଖାଉଥିବା କୌଣସି ସରକାରୀ ଯୋଜନା ମିଳିଲା ନାହିଁ। ଦୟାକରି ଆପଣଙ୍କ ରାଜ୍ୟ କିମ୍ବା କ୍ଷେତ୍ର ଜଣାନ୍ତୁ।",
};

export function generateKnowledgeResponse(
  query: string,
  requestedLanguage: Language,
  conversationId?: string
): ChatResponse {
  // If the user actively picked a language in the selector, honor that selected language!
  // Otherwise detect native Indian script if present in the text.
  const detectedScript = detectLanguage(query, requestedLanguage);
  const language: Language = requestedLanguage && requestedLanguage !== "en"
    ? requestedLanguage
    : (detectedScript || requestedLanguage || "en");

  const intent = detectUserIntent(query);

  // 1. Language inquiry intent (e.g. "Indian languages are there", "which languages", "భాషలు")
  if (intent === "LANGUAGE_QUERY") {
    const langData = LANGUAGE_RESPONSES[language] || LANGUAGE_RESPONSES.en;
    return {
      conversation_id: conversationId || `conv-${Date.now()}`,
      message_id: `msg-${Date.now()}`,
      answer: {
        scheme_id: "system-languages",
        scheme_name: langData.title,
        summary: langData.summary,
        eligibility: langData.supported,
        benefits: [
          "Complete voice speech recognition and audio playback in 11 Indian languages",
          "Automatic language script detection and localized voice synthesis",
          "Comprehensive guidance for farmers, students, healthcare, and employment",
          "Works on low-bandwidth mobile networks across all Indian states",
        ],
        documents_required: ["No documents required to search or query schemes"],
        application_steps: [
          "1. Tap the microphone icon on screen or type your question.",
          "2. Speak in any of the 11 supported Indian languages.",
          "3. Listen to the spoken voice response and view official scheme criteria.",
        ],
        grounded: true,
      },
      sources: [
        {
          title: "Digital India Bhashini Language Portal",
          category: "Multilingual Indian AI",
          source: "Ministry of Electronics and Information Technology (MeitY)",
          last_updated: "2026-01-01",
          doc_id: "system-languages",
          url: "https://bhashini.gov.in",
          verified: true,
        },
      ],
      language,
      suggested_followups: langData.followups,
    };
  }

  // 2. About BharathVoice Platform intent (e.g. "who are you", "what is bharath voice", "what can you do")
  if (intent === "ABOUT_APP") {
    const aboutData = ABOUT_RESPONSES[language] || ABOUT_RESPONSES.en;
    return {
      conversation_id: conversationId || `conv-${Date.now()}`,
      message_id: `msg-${Date.now()}`,
      answer: {
        scheme_id: "system-about",
        scheme_name: aboutData.title,
        summary: aboutData.summary,
        eligibility: ["All Indian Citizens", "Students, Farmers, Workers & Families across all States"],
        benefits: aboutData.capabilities,
        documents_required: ["No documents required to explore schemes"],
        application_steps: [
          "Ask any query using voice or text in 11 Indian languages",
          "Verify eligibility rules, benefits, and required document checklists",
          "Follow step-by-step guidance to apply on official government portals",
        ],
        grounded: true,
      },
      sources: [
        {
          title: "National Government Services Portal",
          category: "Citizen Services",
          source: "National Portal of India (india.gov.in)",
          last_updated: "2026-01-01",
          doc_id: "system-about",
          url: "https://www.india.gov.in",
          verified: true,
        },
      ],
      language,
      suggested_followups: aboutData.followups,
    };
  }

  // 3. Scheme Directory intent (e.g. "all schemes", "list schemes", "అన్ని పథకాలు")
  if (intent === "SCHEME_DIRECTORY") {
    const dirData = DIRECTORY_RESPONSES[language] || DIRECTORY_RESPONSES.en;
    return {
      conversation_id: conversationId || `conv-${Date.now()}`,
      message_id: `msg-${Date.now()}`,
      answer: {
        scheme_id: "system-directory",
        scheme_name: dirData.title,
        summary: dirData.summary,
        eligibility: dirData.categories,
        benefits: [
          "Central & State welfare program guidance across 6 key sectors",
          "Real-time eligibility checking & benefit calculations",
          "Verified document checklists and direct application links",
        ],
        documents_required: [
          "Aadhaar Card",
          "Bank Account Passbook (Aadhaar linked)",
          "Income / Caste Certificate (where applicable)",
          "Land or College records (for agriculture & scholarship schemes)",
        ],
        application_steps: [
          "Search for any specific scheme by voice (e.g., 'PM Kisan', 'Ayushman Bharat')",
          "Check the eligibility checklist and required certificates",
          "Submit your application through the official portal link",
        ],
        grounded: true,
      },
      sources: [
        {
          title: "MyScheme National Portal",
          category: "Government Schemes Directory",
          source: "myscheme.gov.in / National Portal of India",
          last_updated: "2026-01-01",
          doc_id: "system-directory",
          url: "https://www.myscheme.gov.in",
          verified: true,
        },
      ],
      language,
      suggested_followups: dirData.followups,
    };
  }

  // 4. Search Grounded Schemes
  const searchResults = searchSchemes(query, 4);
  const top = searchResults[0];
  const grounded = top && top.score >= 15;

  // 5. Handle Greeting Intent
  if (intent === "GREETING" && (!grounded || top.score < 25)) {
    const greeting = GREETING_RESPONSES[language] || GREETING_RESPONSES.en;
    return {
      conversation_id: conversationId || `conv-${Date.now()}`,
      message_id: `msg-${Date.now()}`,
      answer: {
        scheme_id: "gov-portal-01",
        scheme_name: "BharathVoice AI Citizen Assistant",
        summary: greeting.summary,
        eligibility: ["All Indian Citizens", "Students, Farmers, Workers & Families across India"],
        benefits: ["Direct Scheme Guidance in 11 Indian Languages", "Voice-First Interaction & Document Checklists"],
        documents_required: ["Aadhaar Card (recommended for most schemes)"],
        application_steps: ["Ask BharathVoice about any scheme, check your eligibility, and follow the step-by-step guidance."],
        grounded: true,
      },
      sources: [
        {
          title: "National Government Services Portal",
          category: "Citizen Services",
          source: "National Portal of India (india.gov.in)",
          last_updated: "2026-01-01",
          doc_id: "gov-portal-01",
          url: "https://www.india.gov.in",
          verified: true,
        },
      ],
      language,
      suggested_followups: greeting.followups,
    };
  }

  // 6. If no scheme grounded with confidence, return helpful clarification
  if (!grounded) {
    const msg = NO_SOURCE_MSGS[language] || NO_SOURCE_MSGS.en;
    return {
      conversation_id: conversationId || `conv-${Date.now()}`,
      message_id: `msg-${Date.now()}`,
      answer: {
        summary: msg,
        eligibility: [],
        benefits: [],
        documents_required: [],
        application_steps: [],
        clarifying_question: msg,
        grounded: false,
      },
      sources: [],
      language,
      suggested_followups: LOCALIZED_FOLLOWUPS[language] || LOCALIZED_FOLLOWUPS.en,
    };
  }

  const topScheme = top.scheme;
  let schemeTitle = topScheme.title;
  let schemeSummary = topScheme.description;
  let eligibilityList = topScheme.eligibility || [];
  let benefitsList = topScheme.benefits || [];
  let documentsList = topScheme.documents_required || [];
  let stepsList = topScheme.application_process || [];

  // Check comprehensive localized data in selected language first
  const loc = getLocalizedScheme(topScheme.id, language);
  if (loc) {
    schemeTitle = loc.title;
    schemeSummary = loc.summary;
    eligibilityList = loc.eligibility;
    benefitsList = loc.benefits;
    documentsList = loc.documents_required;
    stepsList = loc.application_steps;
  } else {
    // Check fallback translated cache
    const translationsForLang = SCHEME_TRANSLATIONS[language];
    if (language !== "en" && translationsForLang && translationsForLang[topScheme.id]) {
      const t = translationsForLang[topScheme.id];
      schemeTitle = t.title || schemeTitle;
      schemeSummary = t.summary || schemeSummary;
      eligibilityList = t.eligibility || eligibilityList;
      benefitsList = t.benefits || benefitsList;
      documentsList = t.documents_required || documentsList;
      stepsList = t.application_process || stepsList;
    }
  }

  // 3. User Intention Tuning:
  // Dynamically tailor the lead summary to address the citizen's specific intent directly in their chosen language
  let intentionalSummary = schemeSummary;

  if (intent === "ELIGIBILITY") {
    const eligPoints = eligibilityList.slice(0, 2).join("; ");
    if (language === "hi") {
      intentionalSummary = `पात्रता की जानकारी: ${schemeTitle} के लिए मुख्य पात्रता शर्तें: ${eligPoints}। यदि आप इन शर्तों को पूरा करते हैं, तो आप इसके लिए पात्र हैं।`;
    } else if (language === "te") {
      intentionalSummary = `అర్హత వివరాలు: ${schemeTitle} పథకానికి ప్రధాన అర్హతలు: ${eligPoints}. మీరు ఈ అర్హతలను కలిగి ఉంటే దరఖాస్తు చేసుకోవచ్చు.`;
    } else if (language === "kn") {
      intentionalSummary = `ಅರ್ಹತೆಯ ವಿವರ: ${schemeTitle} ಯೋಜನೆಗೆ ಮುಖ್ಯ ಅರ್ಹತೆಗಳು: ${eligPoints}. ನೀವು ಈ ಷರತ್ತುಗಳನ್ನು ಪೂರೈಸಿದರೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಬಹುದು.`;
    } else if (language === "ta") {
      intentionalSummary = `தகுதி விவரங்கள்: ${schemeTitle} திட்டத்திற்கான முக்கிய தகுதிகள்: ${eligPoints}. இந்த தகுதிகள் இருந்தால் நீங்கள் விண்ணப்பிக்கலாம்.`;
    } else if (language === "mr") {
      intentionalSummary = `पात्रतेची माहिती: ${schemeTitle} साठी मुख्य पात्रता अटी: ${eligPoints}. आपण या अटी पूर्ण केल्यास अर्ज करू शकता.`;
    } else if (language === "bn") {
      intentionalSummary = `যোগ্যতার তথ্য: ${schemeTitle} প্রকল্পের জন্য প্রধান যোগ্যতার শর্ত: ${eligPoints}। আপনি এই শর্ত পূরণ করলে আবেদন করতে পারেন।`;
    } else if (language === "gu") {
      intentionalSummary = `પાત્રતાની વિગતો: ${schemeTitle} માટે મુખ્ય પાત્રતા નિયમો: ${eligPoints}. જો તમે આ શરતો પૂરી કરો છો તો અરજી કરી શકો છો.`;
    } else if (language === "ml") {
      intentionalSummary = `അർഹതാ വിവരങ്ങൾ: ${schemeTitle} പദ്ധതിയുടെ പ്രധാന അർഹതാ മാനദണ്ഡങ്ങൾ: ${eligPoints}. ഈ യോഗ്യതകൾ ഉണ്ടെങ്കിൽ നിങ്ങൾക്ക് അപേക്ഷിക്കാം.`;
    } else if (language === "pa") {
      intentionalSummary = `ਯੋਗਤਾ ਦੇ ਵੇਰਵੇ: ${schemeTitle} ਲਈ ਮੁੱਖ ਯੋਗਤਾ ਸ਼ਰਤਾਂ: ${eligPoints}। ਜੇਕਰ ਤੁਸੀਂ ਇਹ ਸ਼ਰਤਾਂ ਪੂਰੀਆਂ ਕਰਦੇ ਹੋ ਤਾਂ ਅਰਜ਼ੀ ਦੇ ਸਕਦੇ ਹੋ।`;
    } else if (language === "or") {
      intentionalSummary = `ଯୋଗ୍ୟତା ସୂଚନା: ${schemeTitle} ପାଇଁ ମୁଖ୍ୟ ଯୋଗ୍ୟତା ସର୍ତ୍ତ: ${eligPoints}। ଯଦି ଆପଣ ଏହି ସର୍ତ୍ତ ପୂରଣ କରନ୍ତି ତେବେ ଆବେଦନ କରିପାରିବେ।`;
    } else {
      intentionalSummary = `Eligibility Criteria for ${schemeTitle}: ${eligPoints}. You qualify if you meet these requirements.`;
    }
  } else if (intent === "DOCUMENTS") {
    const docPoints = documentsList.slice(0, 3).join(", ");
    if (language === "hi") {
      intentionalSummary = `आवश्यक दस्तावेज़: ${schemeTitle} के लिए आपको ये मुख्य दस्तावेज़ तैयार रखने होंगे: ${docPoints}।`;
    } else if (language === "te") {
      intentionalSummary = `కావలసిన పత్రాలు: ${schemeTitle} కొరకు మీకు అవసరమైన ముఖ్య పత్రాలు: ${docPoints}.`;
    } else if (language === "kn") {
      intentionalSummary = `ಅಗತ್ಯ ದಾಖಲೆಗಳು: ${schemeTitle} ಯೋಜನೆಗಾಗಿ ನೀವು ಒದಗಿಸಬೇಕಾದ ಮುಖ್ಯ ದಾಖಲೆಗಳು: ${docPoints}.`;
    } else if (language === "ta") {
      intentionalSummary = `தேவையான ஆவணங்கள்: ${schemeTitle} திட்டத்திற்கு நீங்கள் சமர்ப்பிக்க வேண்டியவை: ${docPoints}.`;
    } else if (language === "mr") {
      intentionalSummary = `आवश्यक कागदपत्रे: ${schemeTitle} साठी आवश्यक असणारी मुख्य कागदपत्रे: ${docPoints}.`;
    } else if (language === "bn") {
      intentionalSummary = `প্রয়োজনীয় কাগজপত্র: ${schemeTitle} প্রকল্পের জন্য জমা দিতে হবে: ${docPoints}।`;
    } else if (language === "gu") {
      intentionalSummary = `જરૂરી દસ્તાવેજો: ${schemeTitle} માટે તમારે તૈયાર રાખવાના મુખ્ય દસ્તાવેજો: ${docPoints}.`;
    } else if (language === "ml") {
      intentionalSummary = `ആവശ്യമായ രേഖകൾ: ${schemeTitle} പദ്ധതിക്കായി നിങ്ങൾ സമർപ്പിക്കേണ്ട രേഖകൾ: ${docPoints}.`;
    } else if (language === "pa") {
      intentionalSummary = `ਲੋੜੀਂਦੇ ਦਸਤਾਵੇਜ਼: ${schemeTitle} ਲਈ ਲੋੜੀਂਦੇ ਮੁੱਖ ਦਸਤਾਵੇਜ਼: ${docPoints}।`;
    } else if (language === "or") {
      intentionalSummary = `ଆବଶ୍ୟକ ଦସ୍ତାବିଜ: ${schemeTitle} ପାଇଁ ଆବଶ୍ୟକ ମୁଖ୍ୟ ପ୍ରମାଣପତ୍ର: ${docPoints}।`;
    } else {
      intentionalSummary = `Required Documents for ${schemeTitle}: You will need to provide: ${docPoints}.`;
    }
  } else if (intent === "APPLICATION_STEPS") {
    const stepPoints = stepsList.slice(0, 2).join(". ");
    if (language === "hi") {
      intentionalSummary = `आवेदन प्रक्रिया: ${schemeTitle} में आवेदन करने के चरण: ${stepPoints}।`;
    } else if (language === "te") {
      intentionalSummary = `దరఖాస్తు విధానం: ${schemeTitle} కొరకు దరఖాస్తు చేయు విధానం: ${stepPoints}.`;
    } else if (language === "kn") {
      intentionalSummary = `ಅರ್ಜಿ ಸಲ್ಲಿಸುವ ವಿಧಾನ: ${schemeTitle} ಯೋಜನೆಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಲು: ${stepPoints}.`;
    } else if (language === "ta") {
      intentionalSummary = `விண்ணப்பிக்கும் முறை: ${schemeTitle} திட்டத்திற்கு விண்ணப்பிக்க: ${stepPoints}.`;
    } else if (language === "mr") {
      intentionalSummary = `अर्ज करण्याची पद्धत: ${schemeTitle} साठी अर्ज करण्याचे टप्पे: ${stepPoints}.`;
    } else if (language === "bn") {
      intentionalSummary = `আবেদন পদ্ধতি: ${schemeTitle} প্রকল্পে আবেদনের ধাপ: ${stepPoints}।`;
    } else if (language === "gu") {
      intentionalSummary = `અરજી કરવાની પ્રક્રિયા: ${schemeTitle} માં અરજી કરવા માટે: ${stepPoints}.`;
    } else if (language === "ml") {
      intentionalSummary = `അപേക്ഷിക്കേണ്ട രീതി: ${schemeTitle} പദ്ധതിക്ക് അപേക്ഷിക്കാനുള്ള വഴികൾ: ${stepPoints}.`;
    } else if (language === "pa") {
      intentionalSummary = `ਅਰਜ਼ੀ ਦੇਣ ਦੀ ਪ੍ਰਕਿਰਿਆ: ${schemeTitle} ਲਈ ਅਰਜ਼ੀ ਦੇਣ ਦੇ ਪੜਾਅ: ${stepPoints}।`;
    } else if (language === "or") {
      intentionalSummary = `ଆବେଦନ ପ୍ରଣାଳୀ: ${schemeTitle} ପାଇଁ ଆବେଦନ କରିବା ନିୟମ: ${stepPoints}।`;
    } else {
      intentionalSummary = `Application Process for ${schemeTitle}: Follow these steps: ${stepPoints}.`;
    }
  } else if (intent === "BENEFITS") {
    const benPoints = benefitsList.slice(0, 2).join("; ");
    if (language === "hi") {
      intentionalSummary = `योजना के लाभ: ${schemeTitle} के अंतर्गत मिलने वाले मुख्य लाभ: ${benPoints}।`;
    } else if (language === "te") {
      intentionalSummary = `పథకం ప్రయోజనాలు: ${schemeTitle} ద్వారా లభించే ముఖ్య ప్రయోజనాలు: ${benPoints}.`;
    } else if (language === "kn") {
      intentionalSummary = `ಯೋಜನೆಯ ಪ್ರಯೋಜನಗಳು: ${schemeTitle} ಯೋಜನೆಯಿಂದ ಸಿಗುವ ಮುಖ್ಯ ಸೌಲಭ್ಯಗಳು: ${benPoints}.`;
    } else if (language === "ta") {
      intentionalSummary = `திட்ட நன்மைகள்: ${schemeTitle} மூலம் கிடைக்கும் முக்கிய நன்மைகள்: ${benPoints}.`;
    } else if (language === "mr") {
      intentionalSummary = `योजनेचे फायदे: ${schemeTitle} अंतर्गत मिळणारे मुख्य फायदे: ${benPoints}.`;
    } else if (language === "bn") {
      intentionalSummary = `প্রকল্পের সুবিধা: ${schemeTitle} প্রকল্পের প্রধান সুবিধাগুলি হলো: ${benPoints}।`;
    } else if (language === "gu") {
      intentionalSummary = `યોજનાના લાભો: ${schemeTitle} હેઠળ મળતા મુખ્ય લાભો: ${benPoints}.`;
    } else if (language === "ml") {
      intentionalSummary = `പദ്ധതി ആനുകൂല്യങ്ങൾ: ${schemeTitle} വഴി ലഭിക്കുന്ന പ്രധാന നേട്ടങ്ങൾ: ${benPoints}.`;
    } else if (language === "pa") {
      intentionalSummary = `ਸਕੀਮ ਦੇ ਲਾਭ: ${schemeTitle} ਅਧੀਨ ਮਿਲਣ ਵਾਲੇ ਮੁੱਖ ਲਾਭ: ${benPoints}।`;
    } else if (language === "or") {
      intentionalSummary = `ଯୋଜନାର ଲାଭ: ${schemeTitle} ଅଧୀନରେ ମିଳୁଥିବା ମୁଖ୍ୟ ସୁବିଧା: ${benPoints}।`;
    } else {
      intentionalSummary = `Benefits of ${schemeTitle}: The primary benefits provided are: ${benPoints}.`;
    }
  }

  const structured: StructuredAnswer = {
    scheme_id: topScheme.id,
    scheme_name: schemeTitle,
    summary: intentionalSummary,
    eligibility: eligibilityList,
    benefits: benefitsList,
    documents_required: documentsList,
    application_steps: stepsList,
    grounded: true,
  };

  const sources: SourceRef[] = searchResults
    .filter((r) => r.score > 0)
    .map((r) => ({
      title: r.scheme.title,
      category: r.scheme.category,
      source: r.scheme.source,
      last_updated: r.scheme.last_updated,
      doc_id: r.scheme.id,
      url: r.scheme.url,
      verified: true,
    }));

  return {
    conversation_id: conversationId || `conv-${Date.now()}`,
    message_id: `msg-${Date.now()}`,
    answer: structured,
    sources,
    language,
    suggested_followups: LOCALIZED_FOLLOWUPS[language] || LOCALIZED_FOLLOWUPS.en,
  };
}
