"use client";

import { useState, useEffect, useCallback } from "react";
import { Language } from "./types";
import { SITE_DICTIONARY, SiteTranslation, getSiteTranslation } from "./siteDictionary";

export const LANGUAGE_STORAGE_KEY = "bharathvoice_lang";
export const LANGUAGE_CHANGE_EVENT = "bharathvoice_lang_changed";

export function getStoredLanguage(): Language {
  if (typeof window === "undefined") return "en";
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language;
    if (saved && ["en", "hi", "te", "kn", "ta", "mr", "bn", "gu", "ml", "pa", "or"].includes(saved)) {
      return saved;
    }
  } catch {}
  return "en";
}

export function saveLanguage(lang: Language) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    window.dispatchEvent(new CustomEvent(LANGUAGE_CHANGE_EVENT, { detail: lang }));
  } catch {}
}

export function useLanguage() {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    // Initial sync
    setLanguageState(getStoredLanguage());

    function handleLangChange(e: any) {
      if (e.detail && typeof e.detail === "string") {
        setLanguageState(e.detail as Language);
      } else {
        setLanguageState(getStoredLanguage());
      }
    }

    window.addEventListener(LANGUAGE_CHANGE_EVENT, handleLangChange);
    window.addEventListener("storage", handleLangChange);

    return () => {
      window.removeEventListener(LANGUAGE_CHANGE_EVENT, handleLangChange);
      window.removeEventListener("storage", handleLangChange);
    };
  }, []);

  const changeLanguage = useCallback((newLang: Language) => {
    setLanguageState(newLang);
    saveLanguage(newLang);
  }, []);

  const t: SiteTranslation = getSiteTranslation(language);

  return {
    language,
    setLanguage: changeLanguage,
    t,
  };
}
