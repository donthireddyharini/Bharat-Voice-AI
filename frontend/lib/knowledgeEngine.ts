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

  // Check specific functional intents first
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

const GENERAL_SCHEME_WORDS = [
  "scheme", "schemes", "yojana", "yojanagalu", "yojanaye", "pathakam", "pathakalu", "details", "info", "information",
  "cheppandi", "cheppu", "kavali", "unnai", "undi", "batao", "bataiye", "list", "all",
  "ಯೋಜನೆ", "ಯೋಜನೆಗಳು", "ಯೊಜನೆ", "పథకం", "పథకాలు", "వివరాలు", "చెప్పండి", "ఉన్నాయి", "योजना", "योजनाएं", "बताओ",
  "திட்டம்", "திட்டங்கள்", "योजना", "প্রকল্প", "યોજના", "പദ്ധതി", "ਸਕੀਮਾਂ", "ଯୋଜନା",
];

export function searchSchemes(query: string, limit = 4): { scheme: SchemeRecord; score: number }[] {
  const qLower = query.toLowerCase();
  const words = qLower.split(/[\s,?.!;:()\[\]{}]+/).filter((w) => w.length > 1);
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

    // Word matching & synonyms
    for (const word of words) {
      if (sTitle.includes(word)) score += 15;
      else if (sCat.includes(word)) score += 10;
      else if (sDesc.includes(word)) score += 6;
      else if (sAll.includes(word)) score += 3;

      for (const [catKey, synList] of Object.entries(SYNONYMS)) {
        if (synList.some((syn) => word.includes(syn) || syn.includes(word))) {
          if (sCat.toLowerCase().includes(catKey) || sTitle.toLowerCase().includes(catKey)) score += 25;
          if (sAll.includes(catKey)) score += 12;
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
    if (qLower.includes("scholarship") || qLower.includes("స్కాలర్‌షిప్") || qLower.includes("విద్యా") || qLower.includes("student")) {
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
    // Default to flagship PM-KISAN
    return [{ scheme: ALL_SCHEMES[0], score: 20 }];
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

  // 1. Search Grounded Schemes first
  const searchResults = searchSchemes(query, 4);
  const top = searchResults[0];
  const grounded = top && top.score > 0;

  const intent = detectUserIntent(query);

  // 2. Handle Greeting Intent ONLY if user is greeting or no scheme was specifically queried
  if (intent === "GREETING" && (!grounded || top.score < 20)) {
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
