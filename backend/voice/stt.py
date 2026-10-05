"""
Speech-to-Text.

Primary implementation: the frontend uses the browser's native Web Speech
API (SpeechRecognition) for real, zero-latency, zero-key STT in English,
Hindi, Telugu and Kannada, and sends the resulting transcript to
POST /api/voice.

This module provides an optional server-side STT path (e.g. for audio
uploaded from non-browser clients) using Hugging Face's hosted Whisper
inference endpoint, used only if HUGGINGFACE_API_TOKEN is configured.
"""
import os
import requests

HF_API_TOKEN = os.getenv("HUGGINGFACE_API_TOKEN", "")
STT_MODEL = os.getenv("STT_MODEL", "openai/whisper-large-v3")


def transcribe_audio(audio_bytes: bytes) -> str:
    if not HF_API_TOKEN:
        return ""
    try:
        url = f"https://api-inference.huggingface.co/models/{STT_MODEL}"
        headers = {"Authorization": f"Bearer {HF_API_TOKEN}"}
        resp = requests.post(url, headers=headers, data=audio_bytes, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        return data.get("text", "")
    except Exception:
        return ""
