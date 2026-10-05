"""
Supabase client integration for BharathVoice AI.
Allows storing and querying citizen profiles, conversations, messages, and documents
directly in Supabase cloud storage.
"""
import os
import logging
from typing import Optional, Dict, Any, List

logger = logging.getLogger("bharathvoice.supabase")

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY", "")

_client = None

def get_supabase_client():
    global _client
    if _client is not None:
        return _client

    url = os.getenv("SUPABASE_URL", "").strip()
    key = (os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY", "")).strip()

    if not url or not key:
        return None

    try:
        from supabase import create_client, Client
        _client = create_client(url, key)
        logger.info(f"Connected to Supabase at {url}")
        return _client
    except Exception as e:
        logger.warning(f"Could not initialize Supabase client: {e}")
        return None


def is_supabase_configured() -> bool:
    url = os.getenv("SUPABASE_URL", "").strip()
    key = (os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY", "")).strip()
    return bool(url and key and "supabase.co" in url)


def store_conversation_supabase(conversation_id: str, title: str, language: str = "en", user_id: Optional[str] = None) -> bool:
    client = get_supabase_client()
    if not client:
        return False
    try:
        client.table("conversations").upsert({
            "id": conversation_id,
            "title": title,
            "language": language,
            "user_id": user_id or "anonymous",
        }).execute()
        return True
    except Exception as e:
        logger.warning(f"Supabase conversation store notice: {e}")
        return False


def store_message_supabase(conversation_id: str, role: str, content: str, language: str = "en", sources: Optional[List[Dict[str, Any]]] = None) -> bool:
    client = get_supabase_client()
    if not client:
        return False
    try:
        client.table("messages").insert({
            "conversation_id": conversation_id,
            "role": role,
            "content": content,
            "language": language,
            "sources": sources or [],
        }).execute()
        return True
    except Exception as e:
        logger.warning(f"Supabase message store notice: {e}")
        return False


def store_profile_supabase(user_id: str, profile_data: Dict[str, Any]) -> bool:
    client = get_supabase_client()
    if not client:
        return False
    try:
        data = {
            "id": user_id,
            "name": profile_data.get("name"),
            "preferred_language": profile_data.get("preferred_language", "te"),
            "state": profile_data.get("state"),
            "education_level": profile_data.get("education_level"),
            "occupation": profile_data.get("occupation"),
            "interests": profile_data.get("interests", []),
        }
        client.table("users").upsert(data).execute()
        return True
    except Exception as e:
        logger.warning(f"Supabase profile store notice: {e}")
        return False
