"""
Text-to-Speech.

Primary implementation: the frontend uses the browser's native
SpeechSynthesis API to speak the AI's response aloud in the selected
language (real functionality, no backend round-trip needed).

This module exposes an optional server-side TTS path (gTTS) for clients
that cannot use the Web Speech API.
"""
import io


def synthesize_speech(text: str, language: str) -> bytes:
    lang_map = {"en": "en", "hi": "hi", "te": "te", "kn": "kn"}
    try:
        from gtts import gTTS

        tts = gTTS(text=text, lang=lang_map.get(language, "en"))
        buf = io.BytesIO()
        tts.write_to_fp(buf)
        return buf.getvalue()
    except Exception:
        return b""
