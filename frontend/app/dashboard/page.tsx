"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import BrandLogo from "@/components/BrandLogo";
import DashboardLanguageSelector from "@/components/DashboardLanguageSelector";
import { fetchConversations } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useLanguage } from "@/lib/useLanguage";
import { speak, stopSpeaking, startListening } from "@/lib/speech";
import { Language } from "@/lib/types";
import { getSearchHistory, deleteSearchHistoryItem, clearSearchHistory, SearchHistoryEntry, HISTORY_UPDATED_EVENT } from "@/lib/history";
import { getChatSessions, deleteChatSession, clearAllChatSessions, ChatSession, CHAT_SESSIONS_UPDATED_EVENT } from "@/lib/chatSessions";

type DashboardTab = "overview" | "voice" | "schemes" | "history";

interface SchemeItem {
  id: string;
  categoryKey: "all" | "agriculture" | "health" | "education" | "employment" | "housing" | "women" | "welfare" | "identity";
  category: string;
  icon: string;
  title: string;
  desc: string;
  benefit: string;
  eligibility: string[];
  benefitsList: string[];
  documents: string[];
  steps: string[];
  portalUrl: string;
  portalName: string;
}

interface VoicePromptItem {
  id: string;
  icon: string;
  category: string;
  query: string;
  answer: string;
  spokenAnswer: string;
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [conversations, setConversations] = useState<any[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryEntry[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  
  // Tab state synced with URL searchParams (?tab=...)
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");

  // Voice playing state
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [expandedVoiceId, setExpandedVoiceId] = useState<string | null>(null);

  // Live microphone listening state
  const [isListening, setIsListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState<string>("");

  // Schemes Directory filters & search
  const [schemeSearch, setSchemeSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSchemeDetail, setSelectedSchemeDetail] = useState<SchemeItem | null>(null);

  // Read URL query params on mount/update
  useEffect(() => {
    const tabParam = searchParams.get("tab") as DashboardTab;
    if (tabParam && ["overview", "voice", "schemes", "history"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab: DashboardTab) => {
    setActiveTab(tab);
    stopSpeaking();
    setPlayingVoiceId(null);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      window.history.replaceState({}, "", url.toString());
    }
  };

  useEffect(() => {
    fetchConversations().then(setConversations).catch(() => {});
    setSearchHistory(getSearchHistory());
    setChatSessions(getChatSessions());

    const onHistoryUpdate = () => {
      setSearchHistory(getSearchHistory());
      setChatSessions(getChatSessions());
    };

    window.addEventListener(HISTORY_UPDATED_EVENT, onHistoryUpdate);
    window.addEventListener(CHAT_SESSIONS_UPDATED_EVENT, onHistoryUpdate);
    window.addEventListener("storage", onHistoryUpdate);
    return () => {
      window.removeEventListener(HISTORY_UPDATED_EVENT, onHistoryUpdate);
      window.removeEventListener(CHAT_SESSIONS_UPDATED_EVENT, onHistoryUpdate);
      window.removeEventListener("storage", onHistoryUpdate);
      stopSpeaking();
    };
  }, []);

  // 1-Tap Voice Playback toggle
  const togglePlayVoiceAnswer = (item: VoicePromptItem) => {
    if (playingVoiceId === item.id) {
      stopSpeaking();
      setPlayingVoiceId(null);
      return;
    }

    stopSpeaking();
    setPlayingVoiceId(item.id);
    speak(item.spokenAnswer, language, () => {
      setPlayingVoiceId(null);
    });
  };

  // Live Microphone Listening on Dashboard
  const handleStartVoiceRecording = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    stopSpeaking();
    setPlayingVoiceId(null);
    setIsListening(true);
    setLiveTranscript("");

    startListening(
      language,
      (transcript) => {
        setIsListening(false);
        setLiveTranscript(transcript);
        if (transcript.trim()) {
          router.push(`/assistant?q=${encodeURIComponent(transcript.trim())}&lang=${language}`);
        }
      },
      (error) => {
        setIsListening(false);
        alert(error);
      },
      () => {
        setIsListening(false);
      }
    );
  };

  // Comprehensive Welfare Schemes Data with Localized Titles & Descriptions
  const SCHEMES_CATALOG: SchemeItem[] = useMemo(() => [
    {
      id: "pm-kisan",
      categoryKey: "agriculture",
      category: language === "te" ? "వ్యవసాయం" : language === "hi" ? "कृषि" : "Agriculture",
      icon: "🌾",
      title: language === "te" ? "పీఎం కిసాన్ సమ్మాన్ నిధి" : language === "hi" ? "पीएम किसान सम्मान निधि" : "PM-KISAN Samman Nidhi",
      desc: language === "te" ? "రైతు కుటుంబాలకు ఏటా ₹6,000 నేరుగా బ్యాంక్ ఖాతాలో ఆర్థిక సాయం." : language === "hi" ? "किसानों को प्रति वर्ष ₹6,000 की प्रत्यक्ष वित्तीय सहायता।" : "₹6,000 annual direct income support for landholding farmers via DBT.",
      benefit: "₹6,000 / year (3 installments)",
      eligibility: [
        language === "te" ? "సాగు భూమి ఉన్న చిన్న మరియు సన్నకారు రైతు కుటుంబాలు" : "Small and marginal farmer families with cultivable landholding",
        language === "te" ? "రైతు భూమి వివరాలు రాష్ట్ర రెవెన్యూ పోర్టల్‌లో నమోదై ఉండాలి" : "Land ownership records must be updated in state revenue database",
        language === "te" ? "ఆధార్ లింక్ చేయబడిన బ్యాంక్ ఖాతా తప్పనిసరి" : "Aadhaar seeded active bank account required for DBT"
      ],
      benefitsList: [
        language === "te" ? "సంవత్సరానికి 3 విడతల్లో ₹2,000 చొప్పున మొత్తం ₹6,000" : "Rs. 6,000 annually paid in 3 installments of Rs. 2,000 directly via DBT",
        language === "te" ? "మధ్యవర్తులు లేకుండా నేరుగా రైతు ఖాతాలోకి జమ" : "100% transparent and zero commission direct transfers"
      ],
      documents: [
        language === "te" ? "ఆధార్ కార్డు" : "Aadhaar Card",
        language === "te" ? "భూమి పట్టాదారు పాస్‌బుక్ / రికార్డులు" : "Land ownership passbook / Revenue records",
        language === "te" ? "బ్యాంక్ పాస్‌బుక్ వివరాలు" : "Bank account passbook with IFSC"
      ],
      steps: [
        language === "te" ? "pmkisan.gov.in లో 'New Farmer Registration' ఎంచుకోండి" : "Visit pmkisan.gov.in and click New Farmer Registration",
        language === "te" ? "ఆధార్ మరియు భూమి వివరాలను నమోదు చేయండి" : "Submit Aadhaar number and land survey records",
        language === "te" ? "గ్రామ రెవెన్యూ అధికారి ద్వారా పరిశీలన పూర్తయిన తర్వాత లబ్ధి పొందుతారు" : "Village Revenue Officer verifies records for installment release"
      ],
      portalUrl: "https://pmkisan.gov.in",
      portalName: "pmkisan.gov.in"
    },
    {
      id: "pmfby",
      categoryKey: "agriculture",
      category: language === "te" ? "వ్యవసాయం" : language === "hi" ? "कृषि" : "Agriculture",
      icon: "🌱",
      title: language === "te" ? "ప్రధాన మంత్రి ఫసల్ బీమా యోజన" : language === "hi" ? "प्रधानमंत्री फसल बीमा योजना" : "PM Fasal Bima Yojana (PMFBY)",
      desc: language === "te" ? "ప్రకృతి వైపరీత్యాలు, తెగుళ్ల వల్ల పంట నష్టపోతే రైతులకు సమగ్ర బీమా రక్షణ." : language === "hi" ? "प्राकृतिक आपदाओं से फसल नुकसान पर किसानों को व्यापक बीमा।" : "Comprehensive crop loss insurance against droughts, floods, and pests.",
      benefit: "Full Sum Insured Cover",
      eligibility: [
        language === "te" ? "నోటిఫైడ్ పంటలను పండించే రైతులందరూ (కౌలు రైతులు సహా)" : "All farmers growing notified crops in notified areas including tenant farmers",
        language === "te" ? "రుణం తీసుకున్న మరియు తీసుకోని రైతులు ఇద్దరికీ వర్తిస్తుంది" : "Available for both loanee and non-loanee farmers"
      ],
      benefitsList: [
        language === "te" ? "ఖరీఫ్ పంటలకు కేవలం 2%, రబీ పంటలకు 1.5% తక్కువ ప్రీమియం" : "Extremely low premium: 2% for Kharif, 1.5% for Rabi food grains",
        language === "te" ? "విత్తనం నాటడం నుండి కోత తర్వాతి నష్టాల వరకు బీమా" : "Full risk coverage from pre-sowing to post-harvest damages"
      ],
      documents: [
        language === "te" ? "ఆధార్ కార్డు మరియు భూమి పత్రాలు" : "Aadhaar card & land tenancy records",
        language === "te" ? "పంట విత్తిన ధృవీకరణ పత్రం (Sowing Certificate)" : "Crop sowing declaration certificate",
        language === "te" ? "బ్యాంక్ ఖాతా వివరాలు" : "Bank account details"
      ],
      steps: [
        language === "te" ? "pmfby.gov.in పోర్టల్ లేదా బ్యాంకు ద్వారా దరఖాస్తు చేయండి" : "Apply online on pmfby.gov.in or through local bank/CSC",
        language === "te" ? "ప్రీమియం చెల్లించి కట్-ఆఫ్ తేదీలోపు రసీదు పొందండి" : "Pay subsidised premium before the seasonal cut-off date",
        language === "te" ? "పంట నష్టం జరిగితే 72 గంటల్లోగా టోల్ ఫ్రీ 14447 కి తెలియజేయండి" : "Report localized crop damage within 72 hours via Crop Insurance App"
      ],
      portalUrl: "https://pmfby.gov.in",
      portalName: "pmfby.gov.in"
    },
    {
      id: "ayushman-bharat",
      categoryKey: "health",
      category: language === "te" ? "వైద్యం" : language === "hi" ? "स्वास्थ्य" : "Healthcare",
      icon: "🏥",
      title: language === "te" ? "ఆయుష్మాన్ భారత్ (PM-JAY)" : language === "hi" ? "आयुष्मान भारत (PM-JAY)" : "Ayushman Bharat PM-JAY",
      desc: language === "te" ? "పేద కుటుంబాలకు ఏడాదికి ₹5 లక్షల వరకు ఉచిత క్యాష్‌లెస్ ఆసుపత్రి చికిత్స." : language === "hi" ? "प्रति परिवार प्रति वर्ष ₹5 लाख तक का कैशलेस स्वास्थ्य बीमा।" : "₹5 Lakh annual free cashless secondary and tertiary hospitalization cover.",
      benefit: "₹5,00,000 / family / yr",
      eligibility: [
        language === "te" ? "SECC డేటాబేస్ లేదా ఆహార భద్రతా కార్డు ఉన్న కుటుంబాలు" : "Families identified under SECC 2011 criteria or active Ration Card",
        language === "te" ? "కుటుంబ పరిమాణం లేదా వయస్సుపై ఎలాంటి పరిమితి లేదు" : "No cap on family size, gender, or age"
      ],
      benefitsList: [
        language === "te" ? "దేశవ్యాప్తంగా 27,000+ ఎంపానెల్డ్ ఆసుపత్రుల్లో నగదు రహిత చికిత్స" : "Cashless treatment across 27,000+ government and private hospitals nationwide",
        language === "te" ? "మందులు, పరీక్షలు, ఆపరేషన్ ఖర్చులు పూర్తిగా ఉచితం" : "Covers pre-hospitalization, surgeries, intensive care, and diagnostic medicines"
      ],
      documents: [
        language === "te" ? "ఆధార్ కార్డు" : "Aadhaar Card",
        language === "te" ? "రేషన్ కార్డు / కుటుంబ గుర్తింపు పత్రం" : "Ration Card or State Food Security ID",
        language === "te" ? "రిజిస్టర్డ్ మొబైల్ నంబర్" : "Mobile number linked to Aadhaar"
      ],
      steps: [
        language === "te" ? "mera.pmjay.gov.in లో లేదా 14555 నంబర్ ద్వారా అర్హత పరిశీలించండి" : "Check eligibility on mera.pmjay.gov.in or call toll-free 14555",
        language === "te" ? "సమీప ప్రభుత్వ ఆసుపత్రి లేదా CSC కేంద్రంలో ఆయుష్మాన్ కార్డు పొందండి" : "Visit nearest Government Hospital or CSC to get Ayushman Golden Card",
        language === "te" ? "ఆసుపత్రిలో ఆయుష్మాన్ మిత్ర వద్ద కార్డు చూపించి ఉచిత చికిత్స పొందండి" : "Show Ayushman Card at hospital Ayushman Mitra counter for cashless care"
      ],
      portalUrl: "https://nha.gov.in",
      portalName: "nha.gov.in"
    },
    {
      id: "nmmss-scholarship",
      categoryKey: "education",
      category: language === "te" ? "విద్య & స్కాలర్‌షిప్‌లు" : language === "hi" ? "शिक्षा व छात्रवृत्ति" : "Scholarships",
      icon: "🎓",
      title: language === "te" ? "ఎన్‌ఎంఎంఎస్‌ఎస్ నేషనల్ మెరిట్ స్కాలర్‌షిప్" : language === "hi" ? "एनएमएमएसएस छात्रवृत्ति" : "NMMSS Merit Scholarship",
      desc: language === "te" ? "ప్రభుత్వ పాఠశాలల్లో చదివే ప్రతిభావంతులైన విద్యార్థులకు 9 నుండి 12వ తరగతి వరకు ₹12,000." : language === "hi" ? "मेधावी सरकारी स्कूली छात्रों को 9वीं से 12वीं तक ₹12,000 वार्षिक।" : "₹12,000 annual scholarship for meritorious government school students in classes 9 to 12.",
      benefit: "₹12,000 / year (4 years)",
      eligibility: [
        language === "te" ? "ప్రభుత్వ / ఎయిడెడ్ పాఠశాలల్లో 7వ తరగతిలో కనీసం 55% మార్కులు సాధించినవారు" : "Enrolled in government/aided schools with minimum 55% in Class 7",
        language === "te" ? "కుటుంబ వార్షిక ఆదాయం ₹3,50,000 లోపు ఉండాలి" : "Parental annual income from all sources must not exceed Rs. 3,50,000"
      ],
      benefitsList: [
        language === "te" ? "నెలకు ₹1,000 చొప్పున ఏడాదికి ₹12,000 నేరుగా విద్యార్థి ఖాతాలోకి" : "Rs. 12,000 per annum paid directly to student bank account",
        language === "te" ? "9వ తరగతి నుండి ఇంటర్మీడియట్ పూర్తి అయ్యే వరకు 4 సంవత్సరాల సహాయం" : "Continued support across classes 9, 10, 11, and 12"
      ],
      documents: [
        language === "te" ? "7వ/8వ తరగతి మార్కుల జాబితా" : "Class 7/8 mark sheets",
        language === "te" ? "ఆదాయ ధృవీకరణ పత్రం" : "Parental income certificate",
        language === "te" ? "ఆధార్ కార్డు & విద్యార్థి బ్యాంక్ పాస్‌బుక్" : "Student Aadhaar & Aadhaar-linked bank account"
      ],
      steps: [
        language === "te" ? "8వ తరగతిలో రాష్ట్ర స్థాయి NMMSS ప్రవేశ పరీక్ష రాయాలి" : "Appear for State NMMSS selection test in Class 8",
        language === "te" ? "ఎంపికైన విద్యార్థులు scholarships.gov.in లో దరఖాస్తు చేసుకోవాలి" : "Selected students apply on National Scholarship Portal (scholarships.gov.in)",
        language === "te" ? "పాఠశాల మరియు జిల్లా నోడల్ ఆఫీసర్ ధృవీకరణ తర్వాత స్కాలర్‌షిప్ అందుతుంది" : "Verified by School Headmaster and District Officer for DBT release"
      ],
      portalUrl: "https://scholarships.gov.in",
      portalName: "scholarships.gov.in"
    },
    {
      id: "pm-vidyalaxmi",
      categoryKey: "education",
      category: language === "te" ? "విద్య & స్కాలర్‌షిప్‌లు" : language === "hi" ? "उच्च शिक्षा ऋण" : "Education Loans",
      icon: "📚",
      title: language === "te" ? "పీఎం విద్యాలక్ష్మి ఎడ్యుకేషన్ లోన్" : language === "hi" ? "पीएम विद्यालक्ष्मी शिक्षा ऋण" : "PM Vidyalaxmi Education Loan",
      desc: language === "te" ? "ఉన్నత విద్యా సంస్థల్లో ప్రవేశం పొందిన విద్యార్థులకు పూచీకత్తు లేని ₹10 లక్షల వరకు విద్యా రుణం." : language === "hi" ? "शीर्ष संस्थानों में प्रवेश पर ₹10 लाख तक का कोलेटरल-फ्री शिक्षा लोन।" : "Collateral-free higher education loans up to ₹10 Lakhs with interest subvention.",
      benefit: "Up to ₹10 Lakh (No Collateral)",
      eligibility: [
        language === "te" ? "గుర్తింపు పొందిన అగ్రశ్రేణి ఉన్నత విద్యా సంస్థల్లో (NIRF) సీటు పొందినవారు" : "Secured admission in top Quality Higher Education Institutions (QHEIs)",
        language === "te" ? "కుటుంబ వార్షిక ఆదాయం ₹8 లక్షల లోపు ఉన్నవారికి 3% వడ్డీ రాయితీ" : "3% interest subvention for family income up to Rs. 8,00,000 per year"
      ],
      benefitsList: [
        language === "te" ? "ఎలాంటి తనఖా లేదా పూచీకత్తు లేకుండా ₹10 లక్షల వరకు రుణం" : "Collateral-free loans up to Rs. 10 Lakhs",
        language === "te" ? "చదువు పూర్తయ్యే వరకు వడ్డీ రాయితీ సదుపాయం" : "Moratorium period protection with interest subsidy"
      ],
      documents: [
        language === "te" ? "కాలేజ్ అడ్మిషన్ లెటర్ & ఫీజు వివరాలు" : "College admission offer letter & fee structure",
        language === "te" ? "ఆదాయ ధృవీకరణ పత్రం" : "Income certificate",
        language === "te" ? "ఆధార్ కార్డు & విద్యా అర్హత పత్రాలు" : "Aadhaar Card, Class 10 & 12 mark sheets"
      ],
      steps: [
        language === "te" ? "pmvidyalaxmi.gov.in పోర్టల్‌లో రిజిస్టర్ అవ్వండి" : "Register on official pmvidyalaxmi.gov.in portal",
        language === "te" ? "బ్యాంక్ మరియు కోర్సు వివరాలను ఎంచుకుని పత్రాలు అప్‌లోడ్ చేయండి" : "Select participating public/private bank and course",
        language === "te" ? "బ్యాంక్ డిజిటల్ పద్ధతిలో రుణం మంజూరు చేస్తుంది" : "Fast-track digital sanction by participating bank"
      ],
      portalUrl: "https://pmvidyalaxmi.gov.in",
      portalName: "pmvidyalaxmi.gov.in"
    },
    {
      id: "pm-mudra",
      categoryKey: "employment",
      category: language === "te" ? "ఉపాధి & రుణాలు" : language === "hi" ? "स्वरोजगार व ऋण" : "Loans & MSME",
      icon: "💼",
      title: language === "te" ? "పీఎం ముద్రా యోజన (PMMY)" : language === "hi" ? "प्रधानमंत्री मुद्रा योजना" : "PM Mudra Loan Yojana",
      desc: language === "te" ? "చిన్న వ్యాపారాలు, దుకాణాలు, వర్క్‌షాప్‌ల కోసం ₹10 లక్షల వరకు పూచీకత్తు లేని రుణం." : language === "hi" ? "छोटे उद्यमों के लिए ₹10 लाख तक का कोलेटरल-फ्री व्यापारिक ऋण।" : "Collateral-free MSME loans up to ₹10 Lakhs under Shishu, Kishore, and Tarun.",
      benefit: "Up to ₹10 Lakh (No Security)",
      eligibility: [
        language === "te" ? "వ్యాపారం ప్రారంభించాలనుకునే లేదా విస్తరించాలనుకునే భారతీయ పౌరులు" : "Non-corporate, non-farm small/micro entrepreneurs",
        language === "te" ? "ఉత్పాదక, సేవా లేదా వ్యాపార రంగాలలో ఉన్నవారు" : "Manufacturing, trading, processing, and allied service units"
      ],
      benefitsList: [
        language === "te" ? "శిశు: ₹50,000 వరకు, కిషోర్: ₹50,000 నుండి ₹5 లక్షలు, తరుణ్: ₹10 లక్షల వరకు" : "Shishu (up to ₹50K), Kishore (₹50K-₹5L), Tarun (₹5L-₹10L)",
        language === "te" ? "ఎలాంటి కొలేటరల్ సెక్యూరిటీ లేదా తనఖా అవసరం లేదు" : "Zero collateral requirement with affordable interest rates"
      ],
      documents: [
        language === "te" ? "ఆధార్ కార్డు & పాన్ కార్డు" : "Aadhaar Card & PAN Card",
        language === "te" ? "వ్యాపార చిరునామా మరియు ప్రాజెక్ట్ రిపోర్ట్" : "Business proof & project proposal",
        language === "te" ? "బ్యాంక్ స్టేట్‌మెంట్ (గత 6 నెలలు)" : "Bank account statements for past 6 months"
      ],
      steps: [
        language === "te" ? "ఏదైనా జాతీయ బ్యాంక్, గ్రామీణ బ్యాంక్ లేదా udyamimitra.in లో దరఖాస్తు చేయండి" : "Apply online on udyamimitra.in or visit any commercial bank/RRB",
        language === "te" ? "ముద్రా లోన్ దరఖాస్తు ఫారమ్ నింపి పత్రాలు సమర్పించండి" : "Submit standard Mudra loan application form with project details",
        language === "te" ? "పరిశీలన అనంతరం ముద్రా కార్డ్ మరియు లోన్ మంజూరు అవుతుంది" : "Bank sanctions funds and issues Mudra Debit Card for working capital"
      ],
      portalUrl: "https://www.mudra.org.in",
      portalName: "mudra.org.in"
    },
    {
      id: "pm-awas",
      categoryKey: "housing",
      category: language === "te" ? "గృహనిర్మాణం" : language === "hi" ? "आवास" : "Housing",
      icon: "🏠",
      title: language === "te" ? "పీఎం ఆవాస్ యోజన (PMAY)" : language === "hi" ? "प्रधानमंत्री आवास योजना" : "PM Awas Yojana (PMAY)",
      desc: language === "te" ? "సొంత ఇల్లు లేని పేద కుటుంబాలకు పక్కా ఇళ్ల నిర్మాణానికి ప్రభుత్వ ఆర్థిక సాయం మరియు వడ్డీ సబ్సిడీ." : language === "hi" ? "पक्के मकान के निर्माण हेतु सरकारी सब्सिडी एवं वित्तीय सहायता।" : "Financial assistance & credit-linked interest subsidy up to ₹2.67 Lakh for pucca houses.",
      benefit: "Subsidy up to ₹2.67 Lakh",
      eligibility: [
        language === "te" ? "భారతదేశంలో ఎక్కడా పక్కా ఇల్లు లేని నిరుపేద కుటుంబాలు" : "Homeless families or families living in kutcha/dilapidated homes",
        language === "te" ? "EWS లేదా LIG ఆదాయ వర్గానికి చెందినవారు" : "Economically Weaker Section (EWS) and Low Income Groups"
      ],
      benefitsList: [
        language === "te" ? "గ్రామీణ ప్రాంతాల్లో ఇళ్ల నిర్మాణానికి ₹1.20L నుండి ₹1.30L ప్రత్యక్ష సాయం" : "Direct grant of Rs. 1.20L to Rs. 1.30L in rural areas via DBT",
        language === "te" ? "పట్టణ ప్రాంతాల్లో హోమ్ లోన్ వడ్డీపై ₹2.67 లక్షల వరకు సబ్సిడీ" : "Interest subsidy up to Rs. 2.67 Lakh for affordable home loans"
      ],
      documents: [
        language === "te" ? "ఆధార్ కార్డు & రేషన్ కార్డు" : "Aadhaar Card and active Ration Card",
        language === "te" ? "ఆదాయ ధృవీకరణ పత్రం & భూమి హక్కు పత్రం" : "Income certificate & land possession certificate",
        language === "te" ? "బ్యాంక్ ఖాతా పాస్‌బుక్" : "Bank passbook with IFSC code"
      ],
      steps: [
        language === "te" ? "గ్రామీణ ప్రాంతాల్లో గ్రామ సభ/సచివాలయం ద్వారా లేదా pmaymis.gov.in లో దరఖాస్తు చేయండి" : "Apply through Gram Panchayat or online on pmaymis.gov.in",
        language === "te" ? "జియో-ట్యాగింగ్ ద్వారా ఇంటి పురోగతి పరిశీలించబడుతుంది" : "Geo-tagging and site inspection by municipal/panchayat authorities",
        language === "te" ? "విడతలవారీగా డబ్బులు నేరుగా లబ్ధిదారుడి ఖాతాలోకి జమ అవుతాయి" : "Staged DBT payments credited directly as construction progresses"
      ],
      portalUrl: "https://pmaymis.gov.in",
      portalName: "pmaymis.gov.in"
    },
    {
      id: "sukanya-samriddhi",
      categoryKey: "women",
      category: language === "te" ? "మహిళ & శిశు సంక్షేమం" : language === "hi" ? "महिला व बाल विकास" : "Women & Child",
      icon: "👧",
      title: language === "te" ? "సుకున్య సమృద్ధి యోజన (SSY)" : language === "hi" ? "सुकन्या समृद्धि योजना" : "Sukanya Samriddhi Yojana",
      desc: language === "te" ? "బాలికల ఉన్నత చదువు మరియు వివాహానికి గరిష్ట వడ్డీతో కేంద్ర ప్రభుత్వ పొదుపు పథకం." : language === "hi" ? "बालिकाओं के उज्ज्वल भविष्य हेतु उच्च ब्याज वाली सुरक्षित बचत योजना।" : "High-yield 8.2% tax-free savings scheme for girl child education and future.",
      benefit: "8.2% Tax-Free Interest",
      eligibility: [
        language === "te" ? "10 సంవత్సరాల లోపు వయస్సు ఉన్న ఆడపిల్లల పేరుపై తల్లిదండ్రులు ఖాతా తెరవవచ్చు" : "Parents/guardians can open account for girl child below 10 years of age",
        language === "te" ? "ఒక కుటుంబంలో గరిష్టంగా ఇద్దరు ఆడపిల్లలకు మాత్రమే అవకాశం" : "Maximum 2 accounts per family (relaxed for twins/triplets)"
      ],
      benefitsList: [
        language === "te" ? "ప్రస్తుతం వార్షికంగా 8.2% అత్యధిక ప్రభుత్వ వడ్డీ లభిస్తుంది" : "High guaranteed interest rate (8.2% p.a.) compounded annually",
        language === "te" ? "సెక్షన్ 80C కింద పన్ను మినహాయింపు మరియు మెచ్యూరిటీపై పూర్తి పన్ను రహితం" : "Triple tax benefit under EEE regime (Section 80C tax exempt)"
      ],
      documents: [
        language === "te" ? "పాప జనన ధృవీకరణ పత్రం (Birth Certificate)" : "Girl child birth certificate",
        language === "te" ? "తల్లిదండ్రుల ఆధార్ కార్డు & పాన్ కార్డు" : "Parent/guardian Aadhaar Card & PAN Card",
        language === "te" ? "చిరునామా ధృవీకరణ పత్రం & పాస్‌పోర్ట్ సైజ్ ఫోటోలు" : "Address proof & passport size photographs"
      ],
      steps: [
        language === "te" ? "సమీప పోస్టాఫీసు లేదా జాతీయ బ్యాంకు శాఖను సందర్శించండి" : "Visit nearest Post Office or authorized commercial bank branch",
        language === "te" ? "SSY ఖాతా దరఖాస్తు ఫారమ్ నింపి జనన ధృవీకరణ పత్రం జతచేయండి" : "Fill Form-1 and submit birth certificate with parent KYC documents",
        language === "te" ? "కనీసం ₹250 డిపాజిట్ చేసి పాస్‌బుక్ పొందండి" : "Deposit initial opening amount (min ₹250) and collect passbook"
      ],
      portalUrl: "https://www.indiapost.gov.in",
      portalName: "indiapost.gov.in"
    },
    {
      id: "nsap-pension",
      categoryKey: "welfare",
      category: language === "te" ? "సామాజిక సంక్షేమం" : language === "hi" ? "सामाजिक सुरक्षा" : "Social Welfare",
      icon: "👵",
      title: language === "te" ? "జాతీయ వృద్ధాప్య పింఛను (IGNOAPS)" : language === "hi" ? "राष्ट्रीय वृद्धावस्था पेंशन" : "National Old Age Pension (NSAP)",
      desc: language === "te" ? "పేద వృద్ధ పౌరులకు జీవనోపాధి కోసం ప్రతి నెలా క్రమం తప్పకుండా పెన్షన్ సహాయం." : language === "hi" ? "बीपीएल वृद्ध नागरिकों हेतु मासिक सामाजिक सुरक्षा पेंशन।" : "Monthly financial pension assistance for elderly BPL citizens aged 60 and above.",
      benefit: "Monthly Direct Pension",
      eligibility: [
        language === "te" ? "60 సంవత్సరాలు లేదా అంతకంటే ఎక్కువ వయస్సు ఉన్న పౌరులు" : "Senior citizens aged 60 years and above",
        language === "te" ? "దారిద్య్రరేఖకు దిగువన (BPL) జీవిస్తున్న కుటుంబాలకు చెందినవారు" : "Belonging to a household living Below Poverty Line (BPL)"
      ],
      benefitsList: [
        language === "te" ? "ప్రతి నెలా క్రమం తప్పకుండా ఖాతాలో జమ అయ్యే పింఛను మొత్తం" : "Regular monthly direct pension transfer via DBT",
        language === "te" ? "80 ఏళ్లు దాటిన వృద్ధులకు మరింత అదనపు పెన్షన్ ప్రయోజనం" : "Enhanced pension tier for seniors aged 80 years and above"
      ],
      documents: [
        language === "te" ? "ఆధార్ కార్డు & వయస్సు ధృవీకరణ పత్రం" : "Aadhaar Card and age proof certificate",
        language === "te" ? "BPL రేషన్ కార్డు" : "BPL Ration Card",
        language === "te" ? "బ్యాంక్ లేదా పోస్టాఫీస్ ఖాతా వివరాలు" : "Bank or Post Office savings account passbook"
      ],
      steps: [
        language === "te" ? "గ్రామ సచివాలయం లేదా మున్సిపల్ కార్యాలయంలో దరఖాస్తు చేయండి" : "Submit application at Gram Panchayat or Municipal Ward office",
        language === "te" ? "nsap.nic.in పోర్టల్ ద్వారా దరఖాస్తు స్థితి పరిశీలించండి" : "Check verification status online on nsap.nic.in",
        language === "te" ? "మంజూరైన పింఛను ప్రతినెలా మొదటి వారంలో నేరుగా అందుతుంది" : "Approved pension credited directly to bank/post office account"
      ],
      portalUrl: "https://nsap.nic.in",
      portalName: "nsap.nic.in"
    },
    {
      id: "aadhaar-services",
      categoryKey: "identity",
      category: language === "te" ? "పౌర సేవలు & గుర్తింపు" : language === "hi" ? "नागरिक पहचान" : "Citizen Identity",
      icon: "🆔",
      title: language === "te" ? "ఆధార్ ఆన్‌లైన్ సేవలు (UIDAI)" : language === "hi" ? "आधार ऑनलाइन सेवाएं" : "UIDAI Aadhaar Services",
      desc: language === "te" ? "ఆధార్ కార్డు డౌన్‌లోడ్, చిరునామా అప్‌డేట్, మొబైల్ నంబర్ లింక్ మరియు పీవీసీ కార్డు ఆర్డర్." : language === "hi" ? "आधार डाउनलोड, पता सुधार, बायोमेट्रिक लॉक एवं पीवीसी कार्ड ऑर्डर।" : "Instant official Aadhaar downloads, address updates, and PVC smart cards online.",
      benefit: "Official Identity & DBT Access",
      eligibility: [
        language === "te" ? "భారతీయ పౌరులందరికీ అందుబాటులో ఉంటుంది" : "All Indian residents holding a 12-digit Aadhaar number",
        language === "te" ? "చిరునామా మార్పుకు చెల్లుబాటు అయ్యే ప్రూఫ్ అవసరం" : "Valid address proof document required for online correction"
      ],
      benefitsList: [
        language === "te" ? "ప్రభుత్వ సంక్షేమ పథకాలు మరియు DBT కి ఆధార్ అనుసంధానం తప్పనిసరి" : "Universal KYC verification for all government welfare schemes and DBT",
        language === "te" ? "myaadhaar.uidai.gov.in ద్వారా ఇంట్లోనే కూర్చుని సేవల నిర్వహణ" : "Self-service updates from home via myaadhaar.uidai.gov.in"
      ],
      documents: [
        language === "te" ? "12 అంకెల ఆధార్ సంఖ్య" : "12-digit Aadhaar number",
        language === "te" ? "ఆధార్‌తో లింక్ అయిన మొబైల్ నంబర్ (OTP కొరకు)" : "Mobile number linked to Aadhaar for OTP verification",
        language === "te" ? "చిరునామా ధృవీకరణ పత్రం (కరెంట్ బిల్లు, ఓటర్ ఐడీ, పాస్‌పోర్ట్ మొదలైనవి)" : "Valid address proof (Electricity bill, Voter ID, Passport, etc.)"
      ],
      steps: [
        language === "te" ? "myaadhaar.uidai.gov.in వెబ్‌సైట్‌లో లాగిన్ అవ్వండి" : "Login with Aadhaar and OTP at myaadhaar.uidai.gov.in",
        language === "te" ? "Address Update ఎంచుకుని సరైన పత్రం అప్‌లోడ్ చేయండి" : "Select Address Update service and upload valid document",
        language === "te" ? "URN నంబర్ ద్వారా అప్‌డేట్ స్థితిని ట్రాక్ చేయండి" : "Track status with URN acknowledgment number"
      ],
      portalUrl: "https://myaadhaar.uidai.gov.in",
      portalName: "myaadhaar.uidai.gov.in"
    }
  ], [language]);

  // Filtered schemes for Scheme Directory
  const filteredSchemes = useMemo(() => {
    return SCHEMES_CATALOG.filter((s) => {
      const matchesCategory = selectedCategory === "all" || s.categoryKey === selectedCategory;
      const q = schemeSearch.trim().toLowerCase();
      if (!q) return matchesCategory;

      const matchesQuery =
        s.title.toLowerCase().includes(q) ||
        s.desc.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.benefit.toLowerCase().includes(q) ||
        s.portalName.toLowerCase().includes(q);

      return matchesCategory && matchesQuery;
    });
  }, [SCHEMES_CATALOG, selectedCategory, schemeSearch]);

  // Curated Voice Queries with Authoritative Answers in User's Language
  const VOICE_PROMPTS: VoicePromptItem[] = useMemo(() => [
    {
      id: "vp-scholarship",
      icon: "🎓",
      category: language === "te" ? "స్కాలర్‌షిప్‌లు" : language === "hi" ? "छात्रवृत्तियां" : "Scholarships",
      query: t.promptScholarship,
      answer: language === "te"
        ? "నేషనల్ స్కాలర్‌షిప్ పోర్టల్ (scholarships.gov.in) ద్వారా ఆధార్, బ్యాంక్ పాస్‌బుక్ మరియు మార్కుల జాబితాతో దరఖాస్తు చేసుకోవచ్చు. ఎన్‌ఎంఎంఎస్‌ఎస్ (NMMSS) వంటి పథకాల ద్వారా అర్హులైన విద్యార్థులకు ఏటా ₹12,000 స్కాలర్‌షిప్ లభిస్తుంది."
        : language === "hi"
        ? "नेशनल स्कॉलरशिप पोर्टल (scholarships.gov.in) पर आधार, बैंक पासबुक और अंकतालिका के साथ ऑनलाइन आवेदन करें। NMMSS जैसी योजनाओं के तहत पात्र मेधावी छात्रों को ₹12,000 प्रति वर्ष छात्रवृत्ति मिलती है।"
        : "Apply online at the National Scholarship Portal (scholarships.gov.in) with your Aadhaar, bank passbook, and marks certificate. Schemes like NMMSS provide ₹12,000 annually for eligible students.",
      spokenAnswer: language === "te"
        ? "నేషనల్ స్కాలర్‌షిప్ పోర్టల్ ద్వారా ఆధార్ మరియు బ్యాంక్ పాస్‌బుక్‌తో దరఖాస్తు చేసుకోవచ్చు. ఎన్‌ఎంఎంఎస్‌ఎస్ ద్వారా ఏటా పన్నెండు వేల రూపాయల స్కాలర్‌షిప్ లభిస్తుంది."
        : language === "hi"
        ? "नेशनल स्कॉलरशिप पोर्टल पर आधार और बैंक पासबुक के साथ आवेदन करें। पात्र छात्रों को बारह हजार रुपये वार्षिक छात्रवृत्ति मिलती है।"
        : "You can apply on scholarships.gov.in using your Aadhaar and bank details. Eligible students receive twelve thousand rupees per year.",
    },
    {
      id: "vp-kisan",
      icon: "🌾",
      category: language === "te" ? "వ్యవసాయం" : language === "hi" ? "कृषि" : "Agriculture",
      query: t.promptKisan,
      answer: language === "te"
        ? "pmkisan.gov.in వెబ్‌సైట్‌లో 'Know Your Status' పై క్లిక్ చేసి ఆధార్ లేదా రిజిస్ట్రేషన్ నంబర్ నమోదు చేయండి. అర్హులైన రైతులకు ఏటా ₹6,000 మొత్తాన్ని 3 విడతల్లో ₹2,000 చొప్పున నేరుగా బ్యాంక్ ఖాతాలో జమ చేస్తారు."
        : language === "hi"
        ? "pmkisan.gov.in पर 'Know Your Status' में जाकर अपना आधार या पंजीकरण नंबर दर्ज करें। पात्र किसानों को प्रति वर्ष ₹6,000 तीन किस्तों में ₹2,000 सीधे बैंक खाते में मिलते हैं।"
        : "Visit pmkisan.gov.in and click 'Know Your Status' with your registration or Aadhaar number. Eligible farmers receive ₹6,000 annually in three ₹2,000 installments directly via DBT.",
      spokenAnswer: language === "te"
        ? "పీఎం కిసాన్ వెబ్‌సైట్‌లో నో యువర్ స్టేటస్ పై క్లిక్ చేసి ఆధార్ నంబర్ నమోదు చేయండి. రైతులకు ఏటా ఆరు వేల రూపాయల ఆర్థిక సాయం అందుతుంది."
        : language === "hi"
        ? "पीएम किसान पोर्टल पर स्टेटस चेक करें। पात्र किसानों को हर साल छह हजार रुपये की वित्तीय सहायता मिलती है।"
        : "Check status on pmkisan.gov.in using Aadhaar. Eligible farmers receive six thousand rupees yearly.",
    },
    {
      id: "vp-ayushman",
      icon: "🏥",
      category: language === "te" ? "వైద్యం" : language === "hi" ? "स्वास्थ्य" : "Healthcare",
      query: t.promptAyushman,
      answer: language === "te"
        ? "mera.pmjay.gov.in లో లేదా టోల్ ఫ్రీ 14555 కు కాల్ చేసి మీ అర్హత తనిఖీ చేయండి. ఆయుష్మాన్ కార్డు ఉన్న కుటుంబాలకు దేశవ్యాప్తంగా 27,000+ ఆసుపత్రుల్లో ఏడాదికి ₹5 లక్షల వరకు ఉచిత క్యాష్‌లెస్ చికిత్స అందుతుంది."
        : language === "hi"
        ? "mera.pmjay.gov.in पर अथवा टोल-फ्री 14555 पर अपनी पात्रता जांचें। आयुष्मान कार्डधारक परिवारों को देश के 27,000 से अधिक अस्पतालों में प्रति वर्ष ₹5 लाख तक का कैशलेस इलाज मुफ्त मिलता है।"
        : "Check eligibility on mera.pmjay.gov.in or call 14555. Ayushman cardholder families get up to ₹5 Lakh free cashless treatment per year at 27,000+ empaneled hospitals across India.",
      spokenAnswer: language === "te"
        ? "మేరా పిఎంజెఎవై పోర్టల్ లేదా పద్నాలుగు ఐదు వందల యాభై ఐదు నంబర్‌కు కాల్ చేయండి. కుటుంబానికి ఏడాదికి ఐదు లక్షల వరకు ఉచిత ఆసుపత్రి చికిత్స లభిస్తుంది."
        : language === "hi"
        ? "आयुष्मान भारत योजना के तहत प्रति परिवार पांच लाख रुपये तक का कैशलेस अस्पताल इलाज पूरी तरह मुफ्त है।"
        : "Under Ayushman Bharat, eligible families receive up to five lakh rupees free hospital treatment every year.",
    },
    {
      id: "vp-mudra",
      icon: "💼",
      category: language === "te" ? "ఉద్యోగాలు & రుణాలు" : language === "hi" ? "रोजगार व लोन" : "Jobs & Loans",
      query: t.promptJobs,
      answer: language === "te"
        ? "పీఎం ముద్రా యోజన కింద ఎలాంటి పూచీకత్తు లేకుండా ₹10 లక్షల వరకు రుణం పొందవచ్చు: శిశు (₹50,000 వరకు), కిషోర్ (₹5 లక్షల వరకు), తరుణ్ (₹10 లక్షల వరకు). ఏదైనా జాతీయ బ్యాంక్ లేదా గ్రామీణ బ్యాంకులో దరఖాస్తు చేసుకోవచ్చు."
        : language === "hi"
        ? "पीएम मुद्रा योजना के तहत बिना किसी गारंटी के ₹10 लाख तक का लोन मिलता है: शिशु (₹50,000), किशोर (₹5 लाख), और तरुण (₹10 लाख तक)। किसी भी सरकारी या ग्रामीण बैंक में आवेदन करें।"
        : "Under PM Mudra Yojana, get collateral-free business loans up to ₹10 Lakhs: Shishu (up to ₹50K), Kishore (up to ₹5L), and Tarun (up to ₹10L) through any commercial or rural bank.",
      spokenAnswer: language === "te"
        ? "ముద్రా యోజన కింద పూచీకత్తు లేకుండా పది లక్షల రూపాయల వరకు వ్యాపార రుణాలు లభిస్తాయి. సమీప బ్యాంకులో దరఖాస్తు చేసుకోవచ్చు."
        : language === "hi"
        ? "मुद्रा योजना में दस लाख रुपये तक का कोलेटरल-फ्री बिजनेस लोन मिलता है। नजदीकी बैंक शाखा में आवेदन करें।"
        : "Under Mudra Yojana, get collateral-free business loans up to ten lakh rupees through commercial banks.",
    },
    {
      id: "vp-housing",
      icon: "🏠",
      category: language === "te" ? "గృహనిర్మాణం" : language === "hi" ? "आवास" : "Housing",
      query: language === "te"
        ? "పీఎం ఆవాస్ యోజన కింద పక్కా ఇల్లు నిర్మించుకోవడానికి ప్రభుత్వం ఎంత సబ్సిడీ ఇస్తుంది?"
        : language === "hi"
        ? "पीएम आवास योजना के तहत पक्के मकान के लिए कितनी सब्सिडी मिलती है?"
        : "What is the subsidy provided for building a house under PM Awas Yojana?",
      answer: language === "te"
        ? "పీఎం ఆవాస్ యోజన కింద సొంత ఇల్లు లేని పేద కుటుంబాలకు గ్రామీణ ప్రాంతాల్లో ₹1.20 లక్షల నుండి ₹1.30 లక్షల ప్రత్యక్ష ఆర్థిక సాయం, పట్టణాల్లో హోమ్ లోన్ వడ్డీపై ₹2.67 లక్షల వరకు సబ్సిడీ లభిస్తుంది."
        : language === "hi"
        ? "पीएम आवास योजना में ग्रामीण क्षेत्रों में ₹1.20 लाख से ₹1.30 लाख की सीधी सहायता और शहरी क्षेत्रों में होम लोन ब्याज पर ₹2.67 लाख तक की सब्सिडी मिलती है।"
        : "Under PM Awas Yojana, eligible homeless families receive direct assistance of ₹1.20L-₹1.30L in rural areas and interest subsidy up to ₹2.67 Lakh in urban areas.",
      spokenAnswer: language === "te"
        ? "పీఎం ఆవాస్ యోజన ద్వారా గ్రామీణ ప్రాంతాల్లో ఒక లక్ష ఇరవై వేల రూపాయల సాయం, పట్టణాల్లో రెండు లక్షల అరవై ఏడు వేల రూపాయల వరకు సబ్సిడీ అందుతుంది."
        : language === "hi"
        ? "पीएम आवास योजना में पक्के मकान निर्माण के लिए दो लाख सड़सठ हजार रुपये तक की सरकारी सहायता मिलती है।"
        : "Under PM Awas Yojana, get financial assistance and interest subsidy up to two point six seven lakh rupees.",
    },
    {
      id: "vp-sukanya",
      icon: "👧",
      category: language === "te" ? "మహిళ & శిశు సంక్షేమం" : language === "hi" ? "सुकन्या समृद्धि" : "Women & Child",
      query: language === "te"
        ? "సుకున్య సమృద్ధి యోజన ఖాతా నియమాలు మరియు వడ్డీ రేటు ఎంత?"
        : language === "hi"
        ? "सुकन्या समृद्धि योजना के नियम और ब्याज दर क्या है?"
        : "What are the rules and interest rate for Sukanya Samriddhi Yojana?",
      answer: language === "te"
        ? "10 ఏళ్లలోపు బాలికల పేరుతో పోస్టాఫీసు లేదా బ్యాంకులో ఖాతా తెరవవచ్చు. ఏడాదికి కనీసం ₹250 నుండి గరిష్టంగా ₹1.5 లక్ష వరకు జమ చేయవచ్చు. దీనికి 8.2% పన్ను రహిత వార్షిక వడ్డీ లభిస్తుంది."
        : language === "hi"
        ? "10 वर्ष से कम उम्र की बालिकाओं के लिए डाकघर या बैंक में खाता खोलें। न्यूनतम ₹250 से अधिकतम ₹1.5 लाख वार्षिक जमा कर सकते हैं। इस पर 8.2% कर-मुक्त ब्याज मिलता है।"
        : "Open an account for a girl child under 10 years at any post office or bank. Deposit ₹250 to ₹1.5 Lakh per year with a high 8.2% tax-free interest rate under Section 80C.",
      spokenAnswer: language === "te"
        ? "పదేళ్లలోపు బాలికల కోసం సుకున్య సమృద్ధి ఖాతా తెరవవచ్చు. దీనికి వార్షికంగా ఎనిమిది పాయింట్ రెండు శాతం పన్ను రహిత వడ్డీ లభిస్తుంది."
        : language === "hi"
        ? "सुकन्या समृद्धि खाते पर आठ दशमलव दो प्रतिशत की उच्च कर-मुक्त ब्याज दर मिलती है।"
        : "Sukanya Samriddhi Yojana offers a high eight point two percent tax-free interest rate.",
    },
    {
      id: "vp-aadhaar",
      icon: "🆔",
      category: language === "te" ? "ఆధార్ సేవలు" : language === "hi" ? "आधार सेवाएं" : "Identity",
      query: language === "te"
        ? "ఆధార్ కార్డులో చిరునామా లేదా మొబైల్ నంబర్ ఎలా మార్చుకోవాలి?"
        : language === "hi"
        ? "आधार कार्ड में पता या मोबाइल नंबर कैसे बदलें?"
        : "How do I update my address or mobile number in Aadhaar card?",
      answer: language === "te"
        ? "చిరునామా మార్పు కొరకు myaadhaar.uidai.gov.in లో లాగిన్ అయి చెల్లుబాటు అయ్యే ప్రూఫ్ అప్‌లోడ్ చేయండి. మొబైల్ నంబర్ లేదా వేలిముద్రల అప్‌డేట్ కోసం సమీప ఆధార్ సేవా కేంద్రాన్ని సందర్శించాలి."
        : language === "hi"
        ? "पता बदलने के लिए myaadhaar.uidai.gov.in पर लॉगिन कर दस्तावेज अपलोड करें। मोबाइल नंबर और बायोमेट्रिक सुधार हेतु नजदीकी आधार सेवा केंद्र जाएं।"
        : "Update your address online at myaadhaar.uidai.gov.in with valid address proof. For mobile number linking and biometric updates, visit nearest Aadhaar Seva Kendra.",
      spokenAnswer: language === "te"
        ? "చిరునామా మార్పుకు మై ఆధార్ పోర్టల్ ద్వారా ఆన్‌లైన్‌లో చేయవచ్చు. మొబైల్ నంబర్ లింక్ చేయడానికి సమీప ఆధార్ కేంద్రానికి వెళ్లండి."
        : language === "hi"
        ? "पता सुधार के लिए माय आधार पोर्टल पर जाएं। मोबाइल नंबर जोड़ने के लिए आधार सेवा केंद्र पर संपर्क करें।"
        : "Update your address on myaadhaar.uidai.gov.in or visit nearest Aadhaar center for mobile linking.",
    },
    {
      id: "vp-pension",
      icon: "👵",
      category: language === "te" ? "పింఛన్లు" : language === "hi" ? "पेंशन" : "Pensions",
      query: language === "te"
        ? "జాతీయ వృద్ధాప్య పింఛను పథకానికి ఎవరు అర్హులు మరియు ఎలా దరఖాస్తు చేయాలి?"
        : language === "hi"
        ? "राष्ट्रीय वृद्धावस्था पेंशन के लिए कौन पात्र है और कैसे आवेदन करें?"
        : "Who is eligible for National Old Age Pension and how to apply?",
      answer: language === "te"
        ? "దారిద్య్రరేఖకు దిగువన (BPL) ఉన్న 60 ఏళ్లు లేదా అంతకంటే ఎక్కువ వయస్సు ఉన్న సీనియర్ సిటిజన్లు అర్హులు. మీ గ్రామ/వార్డు సచివాలయంలో ఆధార్, వయస్సు ధృవీకరణతో దరఖాస్తు చేసుకోవచ్చు."
        : language === "hi"
        ? "60 वर्ष या अधिक आयु के बीपीएल वरिष्ठ नागरिक पात्र हैं। अपने ग्राम पंचायत या नगरपालिका कार्यालय में आधार और आयु प्रमाण के साथ आवेदन करें।"
        : "Senior citizens aged 60 and above living below poverty line (BPL) are eligible. Apply at your Gram Panchayat or Ward office with Aadhaar and age proof.",
      spokenAnswer: language === "te"
        ? "అరవై ఏళ్లు పైబడిన బిపిఎల్ వృద్ధులకు ప్రతి నెలా పింఛను లభిస్తుంది. గ్రామ సచివాలయంలో దరఖాస్తు చేసుకోవచ్చు."
        : language === "hi"
        ? "साठ वर्ष से अधिक आयु के बीपीएल वृद्ध नागरिकों को मासिक पेंशन मिलती है। ग्राम पंचायत में आवेदन करें।"
        : "Senior citizens aged sixty and above receive monthly pension under the National Social Assistance Programme.",
    }
  ], [language, t]);

  return (
    <div className="flex min-h-screen bg-transparent relative overflow-hidden text-bone">
      <Sidebar />
      
      <main className="flex-1 px-3 sm:px-8 py-4 sm:py-6 max-w-6xl mx-auto relative z-10 min-h-screen overflow-y-auto">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-white/10 flex-wrap relative z-30">
          <div className="flex items-center gap-2.5">
            <Link href="/" className="md:hidden block shrink-0">
              <BrandLogo size="sm" showText={false} />
            </Link>
            <div>
              <h1 className="font-display font-bold text-xl sm:text-2xl text-bone flex items-center gap-2.5 flex-wrap">
                <span>{t.dashTitle}</span>
                <DashboardLanguageSelector value={language} onChange={setLanguage} />
              </h1>
              <p className="text-mist text-xs">{t.dashSubtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <Link
              href="/"
              className="flex items-center gap-1 px-3 py-1.5 rounded-full glass border border-white/15 text-xs font-semibold text-bone hover:border-saffron/40 hover:bg-white/5 active:scale-95 transition-all shadow-sm"
            >
              <span>🏠</span>
              <span className="hidden sm:inline">{t.navHome}</span>
            </Link>
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full glass border border-red-500/20 text-xs font-semibold text-red-200 hover:bg-red-500/10 hover:border-red-500/40 active:scale-95 transition-all cursor-pointer shadow-sm"
            >
              <span>🚪</span>
              <span className="hidden sm:inline">{t.navSignOut}</span>
            </button>
          </div>
        </div>

        {/* NEATLY ARRANGED INTERACTIVE TABS BAR */}
        <div className="flex items-center gap-2 mb-6 p-1.5 glass-strong rounded-2xl border border-white/10 overflow-x-auto custom-scrollbar">
          <button
            type="button"
            onClick={() => handleTabChange("overview")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 whitespace-nowrap cursor-pointer active:scale-95 ${
              activeTab === "overview"
                ? "bg-gradient-to-r from-saffron to-gulal text-white shadow-glow"
                : "text-mist hover:text-bone hover:bg-white/5"
            }`}
          >
            <span>📊</span>
            <span>{t.dashTabOverview}</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("voice")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 whitespace-nowrap cursor-pointer active:scale-95 ${
              activeTab === "voice"
                ? "bg-gradient-to-r from-amethyst to-cyber text-white shadow-glowNeon"
                : "text-mist hover:text-bone hover:bg-white/5"
            }`}
          >
            <span>🎙️</span>
            <span>{t.dashTabVoice}</span>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">1-Tap Voice</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("schemes")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 whitespace-nowrap cursor-pointer active:scale-95 ${
              activeTab === "schemes"
                ? "bg-gradient-to-r from-cyber/80 to-neon text-gray-900 shadow-glowCyan font-bold"
                : "text-mist hover:text-bone hover:bg-white/5"
            }`}
          >
            <span>🏛️</span>
            <span>{t.dashTabSchemes}</span>
            <span className="text-[10px] bg-gray-900/20 px-2 py-0.5 rounded-full font-bold">
              {SCHEMES_CATALOG.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("history")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 whitespace-nowrap cursor-pointer active:scale-95 ${
              activeTab === "history"
                ? "bg-gradient-to-r from-saffron/80 to-amethyst text-white shadow-masterpiece"
                : "text-mist hover:text-bone hover:bg-white/5"
            }`}
          >
            <span>💬</span>
            <span>{t.dashTabHistory}</span>
            {chatSessions.length > 0 && (
              <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-bold">
                {chatSessions.length}
              </span>
            )}
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW */}
        {/* ========================================================================= */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Quick Action Hub Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href={`/assistant?lang=${language}`}
                className="glass-strong rounded-2xl p-6 border border-white/10 hover:border-saffron/50 transition-all duration-300 group active:scale-[0.98] hover:shadow-masterpiece relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-saffron/15 via-gulal/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-saffron/15 text-saffron flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform shadow-glow">
                    🎙️
                  </div>
                  <h3 className="font-display font-bold text-lg text-bone mb-1">{t.dashLiveAssistantTitle}</h3>
                  <p className="text-xs text-mist/85 leading-relaxed mb-4">
                    {t.dashLiveAssistantDesc}
                  </p>
                  <div className="inline-flex items-center gap-2 text-xs font-bold text-saffron group-hover:translate-x-1 transition-transform">
                    <span>{t.dashStartTalking}</span>
                  </div>
                </div>
              </Link>

              <Link
                href="/profile"
                className="glass-strong rounded-2xl p-6 border border-white/10 hover:border-amethyst/50 transition-all duration-300 group active:scale-[0.98] hover:shadow-masterpiece relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amethyst/15 via-neon/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-amethyst/15 text-amethyst flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform shadow-glowPurple">
                    👤
                  </div>
                  <h3 className="font-display font-bold text-lg text-bone mb-1">{t.dashProfileTitle}</h3>
                  <p className="text-xs text-mist/85 leading-relaxed mb-4">
                    {t.dashProfileDesc}
                  </p>
                  <div className="inline-flex items-center gap-2 text-xs font-bold text-amethyst group-hover:translate-x-1 transition-transform">
                    <span>{t.dashManageProfile}</span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Quick Voice Hub Shortcut Banner */}
            <div className="glass-strong rounded-2xl p-5 border border-amethyst/30 bg-gradient-to-r from-amethyst/10 via-cyber/5 to-transparent flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2.5 rounded-2xl bg-amethyst/20 border border-amethyst/30">🎙️</span>
                <div>
                  <h4 className="font-display font-bold text-base text-bone">
                    {language === "te" ? "వన్-ట్యాప్ వాయిస్ ప్రశ్నలు" : language === "hi" ? "वन-टैप वॉइस प्रश्न" : "1-Tap Voice Intelligence"}
                  </h4>
                  <p className="text-xs text-mist/80">
                    {language === "te"
                      ? "స్కాలర్‌షిప్‌లు, పీఎం-కిసాన్, ఆయుష్మాన్ భారత్ సమాధానాలను మీ మాతృభాషలో వినండి."
                      : language === "hi"
                      ? "छात्रवृत्ति, किसान निधि, और आयुष्मान भारत के उत्तर अपनी भाषा में सुनें।"
                      : "Instant audio playback and AI answers for top citizen welfare questions."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleTabChange("voice")}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amethyst to-cyber text-white font-bold text-xs shadow-glowNeon hover:scale-105 active:scale-95 transition-all whitespace-nowrap cursor-pointer"
              >
                {language === "te" ? "వాయిస్ హబ్‌కి వెళ్లండి →" : language === "hi" ? "वॉइस हब खोलें →" : "Open Voice Hub →"}
              </button>
            </div>

            {/* Featured Welfare Schemes Row with direct AI links */}
            <div className="glass-strong rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-base text-bone flex items-center gap-2">
                  <span>🏛️</span>
                  <span>{t.dashSchemesTitle}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => handleTabChange("schemes")}
                  className="text-xs text-saffron hover:underline font-semibold cursor-pointer"
                >
                  {t.dashExploreSchemes} ({SCHEMES_CATALOG.length}) →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {SCHEMES_CATALOG.slice(0, 3).map((s) => (
                  <div
                    key={s.id}
                    className="glass p-4 rounded-xl border border-white/10 hover:border-saffron/30 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xl">{s.icon}</span>
                        <span className="text-[10px] font-bold text-saffron uppercase bg-saffron/10 px-2 py-0.5 rounded-full border border-saffron/20">
                          {s.category}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-bone mb-1">{s.title}</h4>
                      <p className="text-[11px] text-mist/80 mb-3">{s.desc}</p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <span className="text-[10px] text-cyber font-bold">{s.benefit}</span>
                      <Link
                        href={`/assistant?q=${encodeURIComponent(
                          language === "te"
                            ? `${s.title} పథకం గురించి పూర్తి సమాచారం, అర్హతలు మరియు దరఖాస్తు విధానం తెలపండి.`
                            : language === "hi"
                            ? `${s.title} योजना की पात्रता, लाभ और आवेदन प्रक्रिया की जानकारी दें।`
                            : `Tell me full details, eligibility criteria, and application steps for ${s.title}.`
                        )}&lang=${language}`}
                        className="text-xs text-saffron hover:underline font-medium"
                      >
                        {language === "te" ? "అడగండి →" : language === "hi" ? "पूछें →" : "Ask AI →"}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Searches Activity */}
            {searchHistory.length > 0 && (
              <div className="glass-strong rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-bold text-base text-bone flex items-center gap-2">
                    <span>🕒</span>
                    <span>
                      {language === "te"
                        ? "ఇటీవలి శోధనలు"
                        : language === "hi"
                        ? "हाल की खोजें"
                        : "Recent Searches with Timestamps"}
                    </span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleTabChange("history")}
                    className="text-xs text-saffron hover:underline font-semibold cursor-pointer"
                  >
                    {language === "te"
                      ? `అన్నీ చూడండి (${searchHistory.length}) →`
                      : language === "hi"
                      ? `सभी देखें (${searchHistory.length}) →`
                      : `View All (${searchHistory.length}) →`}
                  </button>
                </div>

                <div className="space-y-2.5">
                  {searchHistory.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="glass p-3.5 rounded-xl border border-white/5 hover:border-saffron/30 transition-all flex items-center justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-[10px] text-cyber font-semibold">
                            📅 {item.formattedDate}
                          </span>
                          <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-mist">
                            {item.viaVoice ? "🎙️ Voice" : "🔍 Search"}
                          </span>
                        </div>
                        <Link
                          href={`/assistant?q=${encodeURIComponent(item.query)}&lang=${item.language}`}
                          className="text-xs font-semibold text-bone hover:text-saffron truncate block"
                        >
                          &ldquo;{item.query}&rdquo;
                        </Link>
                      </div>

                      <Link
                        href={`/assistant?q=${encodeURIComponent(item.query)}&lang=${item.language}`}
                        className="text-xs text-saffron hover:text-gulal font-bold whitespace-nowrap"
                      >
                        {language === "te" ? "మళ్లీ అడగండి →" : language === "hi" ? "फिर से पूछें →" : "Ask Again →"}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: VOICE QUERIES (1-Tap Voice Intelligence Hub) */}
        {/* ========================================================================= */}
        {activeTab === "voice" && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Live Interactive Voice Input Bar */}
            <div className="glass-strong rounded-2xl p-6 border border-amethyst/30 relative overflow-hidden bg-gradient-to-r from-amethyst/15 via-cyber/10 to-transparent">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amethyst/20 border border-amethyst/40 text-cyber text-xs font-bold mb-2">
                    <span className="w-2 h-2 rounded-full bg-cyber animate-pulse" />
                    <span>
                      {language === "te" ? "ప్రత్యక్ష వాయిస్ ఇంటెలిజెన్స్" : language === "hi" ? "लाइव वॉइस इंटेलिजेंस" : "Live Voice Intelligence"}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-xl text-bone mb-2">
                    {language === "te"
                      ? "మీ మాతృభాషలో ఏదైనా పథకం గురించి అడగండి"
                      : language === "hi"
                      ? "अपनी मातृभाषा में किसी भी योजना के बारे में पूछें"
                      : "Speak Any Question in Your Mother Tongue"}
                  </h3>
                  <p className="text-xs text-mist/90 max-w-xl leading-relaxed">
                    {language === "te"
                      ? "మైక్రోఫోన్ నొక్కి మాట్లాడండి లేదా కింద ఉన్న ప్రశ్నల సమాధానాలను 1-ట్యాప్‌లో నేరుగా వినండి. భారత్ వాయిస్ AI అధిక నాణ్యతతో వెంటనే సమాధానం ఇస్తుంది."
                      : language === "hi"
                      ? "माइक दबाकर बोलें या नीचे दिए गए प्रश्नों के प्रामाणिक उत्तर 1-टैप में सीधे सुनें।"
                      : "Tap the mic to ask anything by voice, or listen to verified voice answers below with 1-tap HD playback."}
                  </p>
                </div>

                <div className="flex flex-col items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleStartVoiceRecording}
                    className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-glowNeon cursor-pointer transition-all active:scale-95 ${
                      isListening
                        ? "bg-red-500 animate-pulse border-4 border-white text-white"
                        : "bg-gradient-to-tr from-saffron via-gulal to-amethyst text-white hover:scale-110"
                    }`}
                    title={isListening ? "Listening... Click to stop" : "Click to speak"}
                  >
                    {isListening ? "⏹️" : "🎙️"}
                  </button>
                  <span className="text-[11px] font-bold text-cyber">
                    {isListening
                      ? language === "te" ? "వినబడుతోంది... మాట్లాడండి" : language === "hi" ? "सुन रहे हैं... बोलिए" : "Listening... Speak now"
                      : language === "te" ? "మాట్లాడటానికి నొక్కండి" : language === "hi" ? "बोलने के लिए टैप करें" : "Tap to Speak"}
                  </span>
                  {liveTranscript && (
                    <span className="text-xs text-bone font-medium italic max-w-xs text-center truncate">
                      &ldquo;{liveTranscript}&rdquo;
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* List of 1-Tap Curated Voice Queries */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-display font-bold text-base text-bone flex items-center gap-2">
                  <span>🔊</span>
                  <span>
                    {language === "te"
                      ? "ప్రసిద్ధ పౌర వాయిస్ ప్రశ్నలు & సమాధానాలు"
                      : language === "hi"
                      ? "लोकप्रिय नागरिक वॉइस प्रश्न व उत्तर"
                      : "Verified Citizen Voice Queries & Answers"}
                  </span>
                </h4>
                <span className="text-xs text-cyber font-mono font-semibold glass px-2.5 py-1 rounded-lg border border-cyber/20">
                  {VOICE_PROMPTS.length} {language === "te" ? "ప్రశ్నలు" : language === "hi" ? "प्रश्न" : "Prompts"}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {VOICE_PROMPTS.map((item) => {
                  const isPlaying = playingVoiceId === item.id;
                  const isExpanded = expandedVoiceId === item.id;

                  return (
                    <div
                      key={item.id}
                      className={`glass-strong p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                        isPlaying
                          ? "border-cyber shadow-glowCyan bg-cyber/5"
                          : "border-white/10 hover:border-amethyst/40"
                      }`}
                    >
                      <div>
                        {/* Header: Icon & Category */}
                        <div className="flex items-center justify-between mb-2.5">
                          <span className="text-2xl">{item.icon}</span>
                          <span className="text-[10px] uppercase font-bold text-cyber px-2.5 py-0.5 rounded-full bg-cyber/10 border border-cyber/20">
                            {item.category}
                          </span>
                        </div>

                        {/* Question Heading */}
                        <h5 className="text-sm font-bold text-bone mb-2 leading-snug">
                          &ldquo;{item.query}&rdquo;
                        </h5>

                        {/* Expandable/Inline Answer Snippet */}
                        <div className="bg-black/30 rounded-xl p-3 border border-white/5 mb-4">
                          <div className="flex items-center justify-between text-[10px] text-mist mb-1">
                            <span className="font-semibold text-saffron flex items-center gap-1">
                              <span>✓</span>
                              <span>{language === "te" ? "ధృవీకరించిన సమాధానం:" : language === "hi" ? "सत्यापित उत्तर:" : "Verified Answer:"}</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => setExpandedVoiceId(isExpanded ? null : item.id)}
                              className="text-cyber hover:underline cursor-pointer"
                            >
                              {isExpanded ? (language === "te" ? "కుదించు ▲" : "Collapse ▲") : (language === "te" ? "పూర్తిగా చదవండి ▼" : "Read Full ▼")}
                            </button>
                          </div>
                          <p className={`text-xs text-mist/90 leading-relaxed ${isExpanded ? "" : "line-clamp-2"}`}>
                            {item.answer}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons: 1-Tap Listen Audio + Ask AI Assistant */}
                      <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                        <button
                          type="button"
                          onClick={() => togglePlayVoiceAnswer(item)}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95 ${
                            isPlaying
                              ? "bg-red-500/90 hover:bg-red-600 text-white shadow-glow"
                              : "bg-white/10 hover:bg-white/20 text-bone border border-white/15 hover:border-cyber/40"
                          }`}
                        >
                          <span className={isPlaying ? "animate-spin" : ""}>
                            {isPlaying ? "⏹️" : "🔊"}
                          </span>
                          <span>
                            {isPlaying
                              ? language === "te" ? "ఆపండి (Stop)" : language === "hi" ? "रोकें (Stop)" : "Stop Audio"
                              : language === "te" ? "వినండి (Listen)" : language === "hi" ? "सुनें (Listen)" : "Listen Answer"}
                          </span>
                        </button>

                        <Link
                          href={`/assistant?q=${encodeURIComponent(item.query)}&lang=${language}&voice=1`}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-saffron to-gulal text-white text-xs font-bold hover:scale-105 active:scale-95 transition-all shadow-glow flex items-center gap-1"
                        >
                          <span>{language === "te" ? "అసిస్టెంట్‌ను అడగండి" : language === "hi" ? "सहायक से पूछें" : "Ask Assistant"}</span>
                          <span>→</span>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: SCHEMES DIRECTORY (Full Official Public Welfare Directory) */}
        {/* ========================================================================= */}
        {activeTab === "schemes" && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Search & Category Filter Controls */}
            <div className="glass-strong rounded-2xl p-5 border border-white/10 space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-mist text-base">🔍</span>
                  <input
                    type="text"
                    value={schemeSearch}
                    onChange={(e) => setSchemeSearch(e.target.value)}
                    placeholder={
                      language === "te"
                        ? "పథకం పేరు, ప్రయోజనం లేదా కీవర్డ్ ద్వారా శోధించండి (ఉదా. కిసాన్, ఆయుష్మాన్, స్కాలర్‌షిప్, లోన్)..."
                        : language === "hi"
                        ? "योजना का नाम, लाभ या कीवर्ड से खोजें (उदा. किसान, छात्रवृत्ति, लोन, आवास)..."
                        : "Search schemes by name, benefit, or keyword (e.g. Kisan, Ayushman, scholarship, loan)..."
                    }
                    className="w-full pl-11 pr-10 py-3 rounded-xl bg-black/40 border border-white/10 text-sm text-bone placeholder-mist/60 focus:outline-none focus:border-cyber/60 transition-colors"
                  />
                  {schemeSearch && (
                    <button
                      type="button"
                      onClick={() => setSchemeSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-mist hover:text-bone text-sm"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <Link
                  href={`/assistant?q=${encodeURIComponent(
                    language === "te"
                      ? "నా కుటుంబానికి సరిపడే అన్ని ప్రభుత్వ సంక్షేమ పథకాలను తెలపండి."
                      : language === "hi"
                      ? "मेरे परिवार के लिए उपयुक्त सभी सरकारी कल्याणकारी योजनाएं बताएं।"
                      : "Guide me on all government welfare schemes I am eligible for."
                  )}&lang=${language}`}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-cyber/90 to-neon text-gray-900 text-xs font-bold shadow-glowCyan hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0"
                >
                  <span>🎙️ {language === "te" ? "AI అర్హత పరిశీలన" : language === "hi" ? "AI पात्रता जांचें" : "Check Eligibility with AI"}</span>
                  <span>→</span>
                </Link>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none text-xs">
                <span className="text-mist/70 text-[11px] font-semibold uppercase tracking-wider mr-1 shrink-0">
                  {language === "te" ? "వర్గం:" : language === "hi" ? "श्रेणी:" : "Category:"}
                </span>
                {[
                  { id: "all", label: language === "te" ? "అన్నీ (All)" : language === "hi" ? "सभी योजनाएं" : "All Schemes" },
                  { id: "agriculture", label: language === "te" ? "🌾 వ్యవసాయం" : language === "hi" ? "🌾 कृषि" : "🌾 Agriculture" },
                  { id: "health", label: language === "te" ? "🏥 వైద్యం & ఆరోగ్యం" : language === "hi" ? "🏥 स्वास्थ्य" : "🏥 Healthcare" },
                  { id: "education", label: language === "te" ? "🎓 విద్య & స్కాలర్‌షిప్‌లు" : language === "hi" ? "🎓 शिक्षा व छात्रवृत्ति" : "🎓 Education" },
                  { id: "employment", label: language === "te" ? "💼 ఉపాధి & రుణాలు" : language === "hi" ? "💼 रोजगार व लोन" : "💼 MSME & Loans" },
                  { id: "housing", label: language === "te" ? "🏠 గృహనిర్మాణం" : language === "hi" ? "🏠 आवास" : "🏠 Housing" },
                  { id: "women", label: language === "te" ? "👧 మహిళ & శిశు సంక్షేమం" : language === "hi" ? "👧 महिला व बाल विकास" : "👧 Women & Child" },
                  { id: "welfare", label: language === "te" ? "👵 పింఛన్లు & సంక్షేమం" : language === "hi" ? "👵 सामाजिक सुरक्षा" : "👵 Social Welfare" },
                  { id: "identity", label: language === "te" ? "🆔 ఆధార్ & గుర్తింపు" : language === "hi" ? "🆔 नागरिक पहचान" : "🆔 Identity & Aadhaar" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-1.5 rounded-full border transition-all duration-200 whitespace-nowrap font-medium cursor-pointer ${
                      selectedCategory === cat.id
                        ? "bg-cyber/20 border-cyber text-cyber font-bold shadow-glowCyan"
                        : "glass border-white/10 text-mist hover:text-bone hover:border-white/20"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Schemes Count & Status */}
            <div className="flex items-center justify-between text-xs text-mist">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyber" />
                <span>
                  {language === "te"
                    ? `${filteredSchemes.length} సంక్షేమ పథకాలు కనుగొనబడ్డాయి`
                    : language === "hi"
                    ? `${filteredSchemes.length} योजनाएं उपलब्ध हैं`
                    : `Showing ${filteredSchemes.length} verified government welfare schemes`}
                </span>
              </span>
              <span className="text-[11px] text-mist/60 hidden sm:inline">
                {language === "te" ? "100% కేంద్ర మరియు రాష్ట్ర అధికారిక పోర్టల్స్ ద్వారా ధృవీకరించబడింది" : "100% Grounded in Official Govt Portals"}
              </span>
            </div>

            {/* Schemes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSchemes.map((scheme) => (
                <div
                  key={scheme.id}
                  className="glass-strong rounded-2xl p-5 border border-white/10 hover:border-cyber/50 transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 hover:shadow-glowCyan group"
                >
                  <div>
                    {/* Top Row: Icon, Category Badge */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-3xl group-hover:scale-110 transition-transform">{scheme.icon}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-cyber bg-cyber/10 px-2.5 py-0.5 rounded-full border border-cyber/25">
                        {scheme.category}
                      </span>
                    </div>

                    <h4 className="font-display font-bold text-base text-bone mb-1.5 group-hover:text-cyber transition-colors">
                      {scheme.title}
                    </h4>

                    <p className="text-xs text-mist/85 leading-relaxed mb-4 line-clamp-2">
                      {scheme.desc}
                    </p>

                    {/* Benefit Highlight Tag */}
                    <div className="p-2.5 rounded-xl bg-black/30 border border-white/5 mb-4">
                      <div className="text-[10px] text-mist/60 uppercase font-semibold">
                        {language === "te" ? "ముఖ్య ప్రయోజనం (Benefit)" : language === "hi" ? "मुख्य लाभ (Benefit)" : "Key Benefit"}
                      </div>
                      <div className="text-xs font-black text-saffron mt-0.5">
                        {scheme.benefit}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons: View Details + Check Eligibility AI */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedSchemeDetail(scheme)}
                      className="px-3 py-1.5 rounded-lg glass border border-white/15 text-xs font-semibold text-bone hover:border-cyber hover:bg-white/10 transition-all cursor-pointer"
                    >
                      {language === "te" ? "వివరాలు 📋" : language === "hi" ? "विवरण 📋" : "Details 📋"}
                    </button>

                    <Link
                      href={`/assistant?q=${encodeURIComponent(
                        language === "te"
                          ? `${scheme.title} పథకానికి అర్హత ప్రమాణాలు, ప్రయోజనాలు మరియు దరఖాస్తు విధానం ఏమిటి? నా అర్హతను పరిశీలించి చెప్పండి.`
                          : language === "hi"
                          ? `${scheme.title} योजना के लिए पात्रता, लाभ और आवेदन प्रक्रिया क्या है? मेरी पात्रता जांचें।`
                          : `What are the eligibility criteria, benefits, and application steps for ${scheme.title}? Please check my eligibility.`
                      )}&lang=${language}&voice=1`}
                      className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-saffron via-gulal to-amethyst text-white text-xs font-bold shadow-glow hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
                    >
                      {language === "te" ? "అర్హత చూడండి →" : language === "hi" ? "पात्रता जांचें →" : "Check Eligibility →"}
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {filteredSchemes.length === 0 && (
              <div className="glass-strong rounded-2xl p-12 text-center border border-white/10 space-y-3">
                <span className="text-4xl">🔍</span>
                <h4 className="font-bold text-bone text-base">
                  {language === "te" ? "పథకాలు ఏవీ కనుగొనబడలేదు" : language === "hi" ? "कोई योजना नहीं मिली" : "No Schemes Match Your Search"}
                </h4>
                <p className="text-xs text-mist max-w-sm mx-auto">
                  &ldquo;{schemeSearch}&rdquo; {language === "te" ? "కోసం ఫలితాలు లేవు. దయచేసి వేరే పదం ప్రయత్నించండి." : "Please try searching with a different term."}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSchemeSearch("");
                    setSelectedCategory("all");
                  }}
                  className="px-4 py-2 rounded-xl glass border border-saffron/40 text-saffron text-xs font-bold hover:bg-saffron/10 cursor-pointer"
                >
                  {language === "te" ? "ఫిల్టర్లు తొలగించండి" : "Reset Filters"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: SAVED CONVERSATIONS & CHAT SESSIONS */}
        {/* ========================================================================= */}
        {activeTab === "history" && (
          <div className="glass-strong rounded-2xl p-6 border border-white/10 animate-fadeIn space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b border-white/10">
              <div>
                <h3 className="font-display font-bold text-base text-bone flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-saffron shadow-glow" />
                  <span>
                    {language === "te"
                      ? "సేవ్ చేసిన సంభాషణలు"
                      : language === "hi"
                      ? "सुरक्षित बातचीत"
                      : "Saved Conversations"}
                  </span>
                </h3>
                <p className="text-xs text-mist mt-0.5">
                  {language === "te"
                    ? "పూర్తి సంభాషణలు తేదీ, సమయం మరియు పథకాల సమాచారంతో భద్రపరచబడ్డాయి."
                    : language === "hi"
                    ? "तारीख, समय और संपूर्ण योजना विवरण के साथ सुरक्षित की गई बातचीत।"
                    : "Complete conversations saved chronologically with dates, timestamps, and full scheme responses."}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {chatSessions.length > 0 && (
                  <>
                    <span className="text-xs font-semibold text-cyber glass px-2.5 py-1 rounded-lg border border-cyber/20">
                      {chatSessions.length} {language === "te" ? "సంభాషణలు" : language === "hi" ? "बातचीत" : "conversations"}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          confirm(
                            language === "te"
                              ? "సేవ్ చేసిన సంభాషణలన్నీ తొలగించాలా?"
                              : "Are you sure you want to clear all saved conversations?"
                          )
                        ) {
                          clearAllChatSessions();
                        }
                      }}
                      className="text-xs text-red-300 hover:text-red-200 px-3 py-1 rounded-lg glass border border-red-500/20 hover:bg-red-500/10 transition-all cursor-pointer"
                    >
                      {language === "te" ? "అన్నీ తొలగించండి" : language === "hi" ? "सभी हटाएं" : "Clear All"}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* FULL SAVED CHAT SESSIONS */}
            <div className="space-y-3">
              {chatSessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 glass rounded-2xl border border-white/5 border-dashed">
                  <span className="text-4xl mb-3 opacity-50">💬</span>
                  <p className="text-sm text-mist/80 mb-1">
                    {language === "te" ? "ఇంకా సంభాషణలు ఏవీ సేవ్ చేయబడలేదు." : "No saved conversations yet."}
                  </p>
                  <p className="text-xs text-mist/60 mb-4 text-center max-w-sm">
                    {language === "te"
                      ? "భారత్ వాయిస్ AI తో మీరు మాట్లాడే ప్రతి సంభాషణ తేదీ మరియు సమయంతో ఇక్కడ సేవ్ చేయబడుతుంది."
                      : "Every voice conversation with BharathVoice AI will be securely saved here along with the date and time."}
                  </p>
                  <Link
                    href={`/assistant?lang=${language}`}
                    className="px-6 py-2.5 rounded-full bg-gradient-to-r from-saffron to-gulal text-white text-xs font-bold shadow-glow hover:scale-105 active:scale-95 transition-all"
                  >
                    {language === "te"
                      ? "మొదటి సంభాషణ ప్రారంభించండి →"
                      : language === "hi"
                      ? "पहली बातचीत शुरू करें →"
                      : "Start Your First Conversation →"}
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {chatSessions.map((session) => (
                    <div
                      key={session.id}
                      className="glass-strong rounded-xl p-4 border border-white/10 hover:border-saffron/40 transition-all group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs text-mist/70 mb-2">
                          <span className="flex items-center gap-1 font-mono text-cyber font-semibold text-[11px] bg-cyber/10 border border-cyber/25 px-2.5 py-0.5 rounded-full">
                            <span>📅</span>
                            <span>{session.formattedDate}</span>
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase font-bold text-bone">
                              {session.messages.length} messages
                            </span>
                            <button
                              type="button"
                              onClick={() => deleteChatSession(session.id)}
                              className="text-mist/40 hover:text-red-400 text-xs px-1"
                              title="Delete conversation"
                            >
                              ✕
                            </button>
                          </div>
                        </div>

                        <h5 className="font-semibold text-sm text-bone group-hover:text-saffron transition-colors line-clamp-2 mb-2">
                          {session.title || "Voice Assistant Conversation"}
                        </h5>
                      </div>

                      <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[10px] text-mist/70 uppercase tracking-wider font-semibold">
                          🌐 {session.language.toUpperCase()}
                        </span>
                        <Link
                          href={`/assistant?session=${session.id}&lang=${session.language}`}
                          className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-saffron to-gulal text-white text-xs font-bold shadow-glow hover:scale-105 active:scale-95 transition-all flex items-center gap-1"
                        >
                          <span>{language === "te" ? "పూర్తి చాట్ తెరవండి 💬" : language === "hi" ? "पूरी बातचीत खोलें 💬" : "Open Full Chat 💬"}</span>
                          <span>→</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* ========================================================================= */}
      {/* SCHEME DETAIL INTERACTIVE MODAL */}
      {/* ========================================================================= */}
      {selectedSchemeDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="glass-strong border border-white/20 rounded-3xl max-w-2xl w-full p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto space-y-6 shadow-masterpiece">
            
            {/* Modal Close Button */}
            <button
              type="button"
              onClick={() => setSelectedSchemeDetail(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full glass border border-white/20 flex items-center justify-center text-mist hover:text-bone hover:border-red-400 hover:bg-red-500/20 text-sm transition-all cursor-pointer"
            >
              ✕
            </button>

            {/* Scheme Header */}
            <div className="flex items-start gap-4">
              <span className="text-4xl p-3 rounded-2xl bg-white/5 border border-white/10 shrink-0">
                {selectedSchemeDetail.icon}
              </span>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyber bg-cyber/10 px-2.5 py-0.5 rounded-full border border-cyber/20">
                  {selectedSchemeDetail.category}
                </span>
                <h3 className="font-display font-bold text-xl sm:text-2xl text-bone mt-1.5">
                  {selectedSchemeDetail.title}
                </h3>
                <p className="text-xs text-mist/90 mt-1">
                  {selectedSchemeDetail.desc}
                </p>
              </div>
            </div>

            {/* Highlight Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-saffron/20 via-gulal/15 to-transparent border border-saffron/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-saffron tracking-wider">
                  {language === "te" ? "ప్రధాన ఆర్థిక ప్రయోజనం" : language === "hi" ? "मुख्य वित्तीय लाभ" : "Primary Financial Assistance"}
                </span>
                <div className="text-base sm:text-lg font-black text-white mt-0.5">
                  {selectedSchemeDetail.benefit}
                </div>
              </div>
              <a
                href={selectedSchemeDetail.portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-xl glass border border-white/20 text-xs font-bold text-bone hover:border-cyber hover:text-cyber transition-all flex items-center gap-1.5"
              >
                <span>{selectedSchemeDetail.portalName}</span>
                <span>↗</span>
              </a>
            </div>

            {/* Eligibility Criteria */}
            <div className="space-y-2">
              <h4 className="font-bold text-sm text-bone flex items-center gap-2">
                <span>👤</span>
                <span>{language === "te" ? "ఎవరు దరఖాస్తు చేసుకోవచ్చు? (అర్హతలు)" : language === "hi" ? "कौन आवेदन कर सकता है? (पात्रता)" : "Who Can Apply? (Eligibility Criteria)"}</span>
              </h4>
              <ul className="space-y-1.5 pl-2">
                {selectedSchemeDetail.eligibility.map((el, i) => (
                  <li key={i} className="text-xs text-mist/90 flex items-start gap-2">
                    <span className="text-cyber mt-0.5">•</span>
                    <span>{el}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Required Documents */}
            <div className="space-y-2">
              <h4 className="font-bold text-sm text-bone flex items-center gap-2">
                <span>📄</span>
                <span>{language === "te" ? "కావలసిన ముఖ్య పత్రాలు (డాక్యుమెంట్లు)" : language === "hi" ? "आवश्यक दस्तावेज़" : "Required Documents"}</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedSchemeDetail.documents.map((doc, i) => (
                  <span key={i} className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-bone">
                    ✓ {doc}
                  </span>
                ))}
              </div>
            </div>

            {/* Step-by-Step Application Steps */}
            <div className="space-y-2">
              <h4 className="font-bold text-sm text-bone flex items-center gap-2">
                <span>📝</span>
                <span>{language === "te" ? "దరఖాస్తు విధానం (దశలవారీగా)" : language === "hi" ? "आवेदन प्रक्रिया (चरण-दर-चरण)" : "Step-by-Step Application Process"}</span>
              </h4>
              <ol className="space-y-2 pl-2">
                {selectedSchemeDetail.steps.map((step, i) => (
                  <li key={i} className="text-xs text-mist/90 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-saffron/20 border border-saffron/40 text-saffron text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Modal Bottom Actions */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  speak(
                    `${selectedSchemeDetail.title}. ${selectedSchemeDetail.desc}. ${selectedSchemeDetail.benefit}`,
                    language
                  );
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl glass border border-white/15 text-xs font-bold text-bone hover:border-cyber flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>🔊</span>
                <span>{language === "te" ? "సారాంశం వినండి" : language === "hi" ? "विवरण सुनें" : "Listen Overview"}</span>
              </button>

              <Link
                href={`/assistant?q=${encodeURIComponent(
                  language === "te"
                    ? `${selectedSchemeDetail.title} పథకానికి నా అర్హతను పరిశీలించి, దరఖాస్తు చేసుకోవడానికి సహాయం చేయండి.`
                    : language === "hi"
                    ? `${selectedSchemeDetail.title} योजना के लिए मेरी पात्रता जांचें और आवेदन में मदद करें।`
                    : `Please check my eligibility for ${selectedSchemeDetail.title} and assist with application.`
                )}&lang=${language}&voice=1`}
                onClick={() => setSelectedSchemeDetail(null)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-saffron via-gulal to-amethyst text-white text-xs font-bold shadow-glow hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>🎙️ {language === "te" ? "AI తో అర్హత పరిశీలించండి" : language === "hi" ? "AI से पात्रता जांचें" : "Check Eligibility with AI"}</span>
                <span>→</span>
              </Link>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-transparent text-bone flex items-center justify-center p-4">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-saffron border-t-transparent animate-spin" />
            <p className="text-xs font-medium text-mist">Loading Bharat Voice Dashboard...</p>
          </div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
