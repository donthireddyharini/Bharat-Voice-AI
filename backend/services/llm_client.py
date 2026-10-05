"""
LLM client abstraction.

Supports two providers, selected via environment variables so no keys are
hard-coded:

  LLM_PROVIDER=huggingface  -> calls the Hugging Face Inference API
  LLM_PROVIDER=openai       -> calls an OpenAI-compatible /chat/completions endpoint

If no provider/key is configured, generate() returns None and callers fall
back to the deterministic, KB-grounded template generator in rag/generator.py
so the product always answers (never crashes, never fabricates).
"""
import os
import requests

LLM_PROVIDER = os.getenv("LLM_PROVIDER", "").lower()
HF_API_TOKEN = os.getenv("HUGGINGFACE_API_TOKEN", "")
HF_MODEL = os.getenv("HF_LLM_MODEL", "meta-llama/Meta-Llama-3-8B-Instruct")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

TIMEOUT = 20


def is_configured() -> bool:
    if LLM_PROVIDER == "huggingface" and HF_API_TOKEN:
        return True
    if LLM_PROVIDER == "openai" and OPENAI_API_KEY:
        return True
    return False


def generate(prompt: str, max_tokens: int = 400):
    """Return generated text, or None if no LLM is configured / call failed."""
    if not is_configured():
        return None
    try:
        if LLM_PROVIDER == "huggingface":
            return _call_huggingface(prompt, max_tokens)
        if LLM_PROVIDER == "openai":
            return _call_openai(prompt, max_tokens)
    except Exception:
        return None
    return None


def _call_huggingface(prompt: str, max_tokens: int):
    url = f"https://api-inference.huggingface.co/models/{HF_MODEL}"
    headers = {"Authorization": f"Bearer {HF_API_TOKEN}"}
    payload = {"inputs": prompt, "parameters": {"max_new_tokens": max_tokens, "temperature": 0.3}}
    resp = requests.post(url, headers=headers, json=payload, timeout=TIMEOUT)
    resp.raise_for_status()
    data = resp.json()
    if isinstance(data, list) and data and "generated_text" in data[0]:
        return data[0]["generated_text"]
    return None


def _call_openai(prompt: str, max_tokens: int):
    url = f"{OPENAI_BASE_URL}/chat/completions"
    headers = {"Authorization": f"Bearer {OPENAI_API_KEY}", "Content-Type": "application/json"}
    payload = {
        "model": OPENAI_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": max_tokens,
        "temperature": 0.3,
    }
    resp = requests.post(url, headers=headers, json=payload, timeout=TIMEOUT)
    resp.raise_for_status()
    data = resp.json()
    return data["choices"][0]["message"]["content"]
