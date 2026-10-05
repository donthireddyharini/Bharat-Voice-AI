"use client";

import { useEffect, useState } from "react";
import { Language } from "@/lib/types";
import LanguageSelector from "./LanguageSelector";
import { saveProfile } from "@/lib/api";
import {
  isSupabaseConfigured,
  storeProfileInSupabase,
} from "@/lib/supabase";

const STATES = ["Andhra Pradesh", "Telangana", "Karnataka", "Maharashtra", "Tamil Nadu", "Delhi", "Other"];
const EDUCATION = ["School (9-12)", "Intermediate/Diploma", "Undergraduate", "Postgraduate", "Not applicable"];
const INTEREST_OPTIONS = ["Scholarships", "Agriculture", "Employment", "Welfare", "Government Services"];

export default function ProfilePanel() {
  const [name, setName] = useState("");
  const [language, setLanguage] = useState<Language>("en");
  const [state, setState] = useState("");
  const [education, setEducation] = useState("");
  const [occupation, setOccupation] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    const stored = localStorage.getItem("bharathvoice_user_id");
    if (stored) setUserId(stored);
  }, []);

  function toggleInterest(interest: string) {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  }

  async function handleSave() {
    setStatus("saving");
    try {
      const res = await saveProfile({
        user_id: userId,
        name,
        preferred_language: language,
        state,
        education_level: education,
        occupation,
        interests,
      });
      const activeUid = res?.user_id || userId || "citizen-" + Date.now();
      localStorage.setItem("bharathvoice_user_id", activeUid);
      setUserId(activeUid);

      // Also sync to Supabase cloud storage if connected
      if (isSupabaseConfigured()) {
        try {
          await storeProfileInSupabase({
            userId: activeUid,
            name,
            language,
            state,
            education,
            occupation,
            interests,
          });
        } catch (sbErr) {
          console.warn("Supabase profile sync notice:", sbErr);
        }
      }

      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="glass rounded-2xl p-6 sm:p-8 border border-white/8 max-w-3xl space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold mb-1 text-bone">Citizen Profile</h2>
        <p className="text-xs sm:text-sm text-mist">
          Used to personalize BharathVoice&apos;s recommendations and verify eligibility in your language.
        </p>
      </div>

      <div className="grid gap-6">
        <Field label="Full Name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ramesh Sharma"
            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-bone outline-none focus:border-saffron/50 transition-colors"
          />
        </Field>

        <Field label="Preferred Language">
          <LanguageSelector value={language} onChange={setLanguage} />
        </Field>

        <Field label="State of Residence">
          <div className="flex flex-wrap gap-2">
            {STATES.map((s) => (
              <Chip key={s} active={state === s} onClick={() => setState(s)} label={s} />
            ))}
          </div>
        </Field>

        <Field label="Education Level">
          <div className="flex flex-wrap gap-2">
            {EDUCATION.map((e) => (
              <Chip key={e} active={education === e} onClick={() => setEducation(e)} label={e} />
            ))}
          </div>
        </Field>

        <Field label="Occupation">
          <input
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
            placeholder="e.g. Farmer, Student, Small Business, Homemaker"
            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-bone outline-none focus:border-saffron/50 transition-colors"
          />
        </Field>

        <Field label="Interest Areas">
          <div className="flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map((i) => (
              <Chip key={i} active={interests.includes(i)} onClick={() => toggleInterest(i)} label={i} />
            ))}
          </div>
        </Field>

        <div className="pt-2 flex items-center gap-4">
          <button
            onClick={handleSave}
            className="rounded-full bg-gradient-to-r from-saffron to-gulal px-7 py-3 text-sm font-bold text-white shadow-glow hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            {status === "saving" ? "Saving Profile…" : "Save Profile →"}
          </button>
          {status === "saved" && <span className="text-xs text-cyber font-medium">✓ Profile saved &amp; synced successfully!</span>}
          {status === "error" && <span className="text-xs text-red-300">Could not save right now. Please try again.</span>}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-mist mb-2 font-medium">{label}</div>
      {children}
    </div>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-xs px-3.5 py-1.5 rounded-full border transition-all active:scale-95 cursor-pointer ${
        active
          ? "border-saffron bg-saffron/15 text-saffron font-bold shadow-glow"
          : "border-white/10 text-mist hover:border-white/25 hover:text-bone glass"
      }`}
    >
      {label}
    </button>
  );
}
