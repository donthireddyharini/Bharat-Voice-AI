"use client";

import { useState } from "react";

const JOURNEY_STEPS = ["Need", "Profile", "Eligibility", "Documents", "Application", "Official Source"];

interface EligibilityFlowProps {
  onComplete: (composedQuery: string) => void;
}

const QUESTIONS = [
  { key: "need", label: "What do you need help with?", options: ["Scholarship", "Farmer support", "Employment scheme", "Welfare benefit"] },
  { key: "level", label: "What is your current education / occupation level?", options: ["School (9-12)", "Undergraduate (B.Tech/Degree)", "Postgraduate", "Farmer / Self-employed"] },
  { key: "state", label: "Which state are you in?", options: ["Andhra Pradesh", "Karnataka", "Telangana", "Other"] },
  { key: "basis", label: "Should we prioritise?", options: ["Income-based", "Merit-based", "Both"] },
];

export default function EligibilityFlow({ onComplete }: EligibilityFlowProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const activeJourneyIndex = Math.min(step, JOURNEY_STEPS.length - 1);

  function handleAnswer(value: string) {
    const key = QUESTIONS[step].key;
    const updated = { ...answers, [key]: value };
    setAnswers(updated);

    if (step + 1 < QUESTIONS.length) {
      setStep(step + 1);
    } else {
      const query = `I need help with ${updated.need} for someone at ${updated.level} level in ${updated.state}, prioritising ${updated.basis} criteria.`;
      onComplete(query);
    }
  }

  return (
    <div className="glass rounded-2xl p-5 border border-white/5">
      <h3 className="font-display font-semibold mb-4">Your Journey</h3>

      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {JOURNEY_STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`text-xs px-3 py-1.5 rounded-full border ${
                i <= activeJourneyIndex
                  ? "border-saffron text-bone bg-saffron/10"
                  : "border-white/10 text-mist/50"
              }`}
            >
              {label}
            </div>
            {i < JOURNEY_STEPS.length - 1 && <span className="text-mist/30 text-xs">↓</span>}
          </div>
        ))}
      </div>

      {step < QUESTIONS.length && (
        <div>
          <p className="text-sm text-bone/90 mb-3">{QUESTIONS[step].label}</p>
          <div className="flex flex-wrap gap-2">
            {QUESTIONS[step].options.map((opt) => (
              <button
                key={opt}
                onClick={() => handleAnswer(opt)}
                className="text-sm px-4 py-2 rounded-xl glass border border-white/10 hover:border-saffron/40 transition"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
