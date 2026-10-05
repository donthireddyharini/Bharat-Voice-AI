"""
High-definition Neural TTS Service for Indian Languages.
Uses Microsoft Edge Neural TTS (edge-tts) for studio-grade, 100% fluent native accents,
with automatic fallback to Google Translate TTS (gTTS).
"""
import io
import re
import asyncio
import hashlib
from typing import Optional

try:
    import edge_tts
except ImportError:
    edge_tts = None

try:
    from gtts import gTTS
except ImportError:
    gTTS = None

# Studio-grade Neural voices for Indian languages
EDGE_VOICE_MAP = {
    "te": "te-IN-MohanNeural",   # Authentic fluent Telugu native speaker
    "hi": "hi-IN-SwaraNeural",   # Fluent natural Hindi speaker
    "kn": "kn-IN-GaganNeural",   # Fluent native Kannada speaker
    "en": "en-IN-NeerjaNeural",  # Fluent Indian English
}

# Fallback Google TTS locale codes
GTTS_LANG_MAP = {
    "te": "te",
    "hi": "hi",
    "kn": "kn",
    "en": "en",
}

# In-memory audio cache for instant playback of repeated phrases
_AUDIO_CACHE: dict[str, bytes] = {}


def clean_text_for_tts(text: str, language: str) -> str:
    """Cleans markdown, URLs, and formatting artifacts before synthesis."""
    if not text:
        return ""
    # Strip markdown symbols & URLs
    cleaned = re.sub(r'https?://\S+', '', text)
    cleaned = re.sub(r'[*_#`~>\[\]\(\)\{\}]', ' ', cleaned)
    # Remove zero-width characters
    cleaned = re.sub(r'[\u200B-\u200D\uFEFF]', '', cleaned)
    # Fix currency & unit representations
    if language == "te":
        cleaned = re.sub(r'రూ\.\s*', 'రూపాయలు ', cleaned)
        cleaned = re.sub(r'రూ\s+', 'రూపాయలు ', cleaned)
    elif language == "hi":
        cleaned = re.sub(r'रु\.\s*', 'रुपये ', cleaned)
        cleaned = re.sub(r'रु\s+', 'रुपये ', cleaned)
    elif language == "kn":
        cleaned = re.sub(r'ರೂ\.\s*', 'ರೂಪಾಯಿ ', cleaned)
    elif language == "en":
        cleaned = re.sub(r'Rs\.\s*', 'Rupees ', cleaned, flags=re.I)
        cleaned = re.sub(r'Govt\.\s*', 'Government ', cleaned, flags=re.I)

    cleaned = re.sub(r'\s+', ' ', cleaned).strip()

    # For instant voice playback, articulate the core answer directly (first 2 sentences)
    sentences = re.split(r'(?<=[.!?।])\s+', cleaned)
    if len(sentences) > 2 and len(cleaned) > 220:
        cleaned = " ".join(sentences[:2])

    return cleaned


async def generate_speech_edge(text: str, voice: str) -> bytes:
    """Synthesizes speech using edge-tts neural voices."""
    communicate = edge_tts.Communicate(text, voice)
    buffer = bytearray()
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            buffer.extend(chunk["data"])
    return bytes(buffer)


def generate_speech_gtts(text: str, lang: str) -> bytes:
    """Fallback synthesis using gTTS (Google Translate TTS)."""
    if gTTS is None:
        raise RuntimeError("gTTS is not installed")
    tts = gTTS(text=text, lang=lang, tld="co.in")
    fp = io.BytesIO()
    tts.write_to_fp(fp)
    fp.seek(0)
    return fp.read()


async def synthesize_speech(text: str, language: str = "te") -> bytes:
    """
    Synthesizes speech for the given text and Indian language.
    Returns MP3 audio bytes.
    """
    clean = clean_text_for_tts(text, language)
    if not clean:
        clean = "No text provided."

    # Check cache
    cache_key = hashlib.md5(f"{language}:{clean}".encode("utf-8")).hexdigest()
    if cache_key in _AUDIO_CACHE:
        return _AUDIO_CACHE[cache_key]

    # 1. Primary: Edge Neural TTS
    if edge_tts is not None:
        voice = EDGE_VOICE_MAP.get(language, "en-IN-NeerjaNeural")
        try:
            audio_bytes = await generate_speech_edge(clean, voice)
            if audio_bytes and len(audio_bytes) > 200:
                _AUDIO_CACHE[cache_key] = audio_bytes
                return audio_bytes
        except Exception as e:
            print(f"[TTS] Edge-TTS notice for {language}: {e}, falling back to gTTS")

    # 2. Fallback: Google TTS (gTTS)
    gtts_lang = GTTS_LANG_MAP.get(language, "en")
    try:
        loop = asyncio.get_event_loop()
        audio_bytes = await loop.run_in_executor(None, generate_speech_gtts, clean, gtts_lang)
        if audio_bytes:
            _AUDIO_CACHE[cache_key] = audio_bytes
            return audio_bytes
    except Exception as e:
        print(f"[TTS] gTTS fallback failed for {language}: {e}")

    raise RuntimeError(f"Could not synthesize speech for language '{language}'.")
