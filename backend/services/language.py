"""
Language utilities: canned UI/system-message translations plus automatic
free-form translation via MyMemoryTranslator and pluggable LLM support.
Supports English, Hindi, Telugu, and Kannada with natural phrasing and accent tuning.
"""
import re
from functools import lru_cache
from services import llm_client

LANGUAGE_NAMES = {
    "en": "English",
    "hi": "Hindi (हिन्दी)",
    "te": "Telugu (తెలుగు)",
    "kn": "Kannada (ಕನ್ನಡ)",
    "ta": "Tamil (தமிழ்)",
    "mr": "Marathi (मराठी)",
    "bn": "Bengali (বাংলা)",
    "gu": "Gujarati (ગુજરાતી)",
    "ml": "Malayalam (മലയാളം)",
    "pa": "Punjabi (ਪੰਜਾਬੀ)",
    "or": "Odia (ଓଡ଼ିଆ)",
}

LOCALE_MAP = {
    "en": "en-GB",
    "hi": "hi-IN",
    "te": "te-IN",
    "kn": "kn-IN",
    "ta": "ta-IN",
    "mr": "mr-IN",
    "bn": "bn-IN",
    "gu": "gu-IN",
    "ml": "ml-IN",
    "pa": "pa-IN",
    "or": "or-IN",
}

# Canned, reliable translations for core system messages
SYSTEM_STRINGS = {
    "no_source_found": {
        "en": "I couldn't find a verified source for that in the BharathVoice knowledge base. Could you tell me more — for example your state, education level, or the specific scheme name?",
        "hi": "मुझे BharathVoice ज्ञान आधार में इसके लिए कोई सत्यापित स्रोत नहीं मिला। क्या आप मुझे और बता सकते हैं — जैसे आपका राज्य, शिक्षा स्तर, या योजना का नाम?",
        "te": "నాకు BharathVoice నాలెడ్జ్ బేస్‌లో దీనికి ధృవీకరించిన మూలం కనుగొనబడలేదు. దయచేసి మీ రాష్ట్రం, విద్యా స్థాయి లేదా పథకం పేరు వంటి మరిన్ని వివరాలు తెలియజేయగలరా?",
        "kn": "ಇದಕ್ಕೆ BharathVoice ಜ್ಞಾನ ಬಾಂಡಾರದಲ್ಲಿ ಪರಿಶೀಲಿತ ಮೂಲ ನನಗೆ ಸಿಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ರಾಜ್ಯ, ಶಿಕ್ಷಣ ಮಟ್ಟ ಅಥವಾ ಯೋಜನೆಯ ಹೆಸರಿನಂತಹ ಹೆಚ್ಚಿನ ವಿವರಗಳನ್ನು ತಿಳಿಸುವಿರಾ?",
    },
    "empty_query": {
        "en": "Please type or speak a question so I can help you.",
        "hi": "कृपया एक प्रश्न टाइप करें या बोलें ताकि मैं आपकी मदद कर सकूं।",
        "te": "నేను మీకు సహాయం చేయడానికి దయచేసి ఒక ప్రశ్నను టైప్ చేయండి లేదా మాట్లాడండి.",
        "kn": "ನಾನು ನಿಮಗೆ ಸಹಾಯ ಮಾಡಲು ದಯವಿಟ್ಟು ಪ್ರಶ್ನೆಯನ್ನು ಟೈಪ್ ಮಾಡಿ ಅಥವಾ ಮಾತನಾಡಿ.",
    },
    "generation_error": {
        "en": "Something went wrong while generating the response. Please try again.",
        "hi": "उत्तर तैयार करते समय कुछ गड़बड़ हो गई। कृपया पुनः प्रयास करें।",
        "te": "సమాధానం సిద్ధం చేసేటప్పుడు ఏదో తప్పు జరిగింది. దయచేసి మళ్ళీ ప్రయత్నించండి.",
        "kn": "ಉತ್ತರ ಸಿದ್ಧಪಡಿಸುವಾಗ ಏನೋ ತಪ್ಪಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
    },
    "who_can_apply": {
        "en": "Who can apply?",
        "hi": "कौन आवेदन कर सकता है?",
        "te": "ఎవరు దరఖాస్తు చేసుకోవచ్చు?",
        "kn": "ಯಾರು ಅರ್ಜಿ ಸಲ್ಲಿಸಬಹುದು?",
    },
    "benefits": {
        "en": "Benefits",
        "hi": "लाभ",
        "te": "ప్రయోజనాలు",
        "kn": "ಪ್ರಯೋಜನಗಳು",
    },
    "documents_required": {
        "en": "Required Documents",
        "hi": "आवश्यक दस्तावेज़",
        "te": "కావలసిన పత్రాలు",
        "kn": "ಅಗತ್ಯವಿರುವ ದಾಖಲೆಗಳು",
    },
    "how_to_apply": {
        "en": "How to Apply",
        "hi": "आवेदन कैसे करें",
        "te": "దరఖాస్తు విధానం",
        "kn": "ಅರ್ಜಿ ಸಲ್ಲಿಸುವುದು ಹೇಗೆ",
    },
    "verified_source": {
        "en": "Verified Source",
        "hi": "सत्यापित स्रोत",
        "te": "ధృవీకరించిన మూలం",
        "kn": "ಪರಿಶೀಲಿತ ಮೂಲ",
    },
}


def t(key: str, language: str) -> str:
    entry = SYSTEM_STRINGS.get(key, {})
    return entry.get(language, entry.get("en", key))


def clean_slang_and_script(text: str, language: str) -> str:
    """Refines machine-translated text into fluent, natural regional phrasing
    and removes zero-width spaces/artifacts that cause TTS speech stutter."""
    if not text:
        return text

    # Remove zero-width non-joiners & joiners that break speech synthesis pronunciation
    text = text.replace("\u200c", "").replace("\u200d", "").replace("\u200b", "").replace("\ufeff", "")
    
    # Fix detached punctuation and split words e.g., 'రూ .' -> 'రూ. '
    text = re.sub(r'రూ\s*\.\s*', 'రూ. ', text)
    text = re.sub(r'ரூ\s*\.\s*', 'ரூ. ', text)
    text = re.sub(r'रू\s*\.\s*', 'रू. ', text)
    text = re.sub(r'రూ\s+', 'రూ. ', text)

    # Clean double spaces around punctuation
    text = re.sub(r'\s+([,.:;?!])', r'\1', text)
    text = re.sub(r'\s{2,}', ' ', text).strip()

    # Telugu natural phrasing touch-ups
    if language == "te":
        text = text.replace("స్కాలర్ షిప్", "స్కాలర్‌షిప్")
        text = text.replace("స్కాలర్ ‌ షిప్", "స్కాలర్‌షిప్")
        text = text.replace("విద్యార్ధి", "విద్యార్థి")
        text = text.replace("అర్హతను కలిగి ఉండాలి", "అర్హులు")

    return text


@lru_cache(maxsize=2048)
def _translate_with_mymemory(text: str, target_language: str) -> str:
    """Translates text using deep-translator's MyMemory service with caching."""
    try:
        from deep_translator import MyMemoryTranslator
        target_locale = LOCALE_MAP.get(target_language, f"{target_language}-IN")
        result = MyMemoryTranslator(source="en-GB", target=target_locale).translate(text)
        if result and not result.startswith("MYMEMORY WARNING") and not result.startswith("PLEASE SELECT"):
            return clean_slang_and_script(result, target_language)
    except Exception as exc:
        print(f"MyMemory translation exception for '{text[:30]}...': {exc}")
    return text


def translate(text: str, target_language: str) -> str:
    """Free-form translation into target language (Hindi, Telugu, Kannada, Tamil).
    Priority:
    1. LLM (if API key is configured)
    2. MyMemoryTranslator (high quality, free, zero-config)
    3. Return original text if error
    """
    if target_language == "en" or not text or not text.strip():
        return text

    # If an LLM is configured, use it for contextual multilingual composition
    if llm_client.is_configured():
        prompt = (
            f"You are BharathVoice AI, a fluent multilingual assistant. "
            f"Translate the following public service text into natural, respectful, conversational {LANGUAGE_NAMES.get(target_language, target_language)}. "
            f"Use authentic native phrasing, idioms, and natural slang appropriate for citizen assistance. "
            f"Do NOT insert mechanical punctuation or awkward literal translations. "
            f"Return ONLY the natural translation.\n\nText: {text}"
        )
        llm_result = llm_client.generate(prompt, max_tokens=500)
        if llm_result and llm_result.strip():
            return clean_slang_and_script(llm_result.strip(), target_language)

    # Otherwise use MyMemoryTranslator with post-cleaning
    translated = _translate_with_mymemory(text.strip(), target_language)
    return clean_slang_and_script(translated, target_language)


def translate_list(items: list[str], target_language: str) -> list[str]:
    """Translates a list of strings concurrently into the target language."""
    if target_language == "en" or not items:
        return items
    from concurrent.futures import ThreadPoolExecutor
    try:
        with ThreadPoolExecutor(max_workers=min(len(items), 6)) as executor:
            return list(executor.map(lambda item: translate(item, target_language), items))
    except Exception:
        return [translate(item, target_language) for item in items]
