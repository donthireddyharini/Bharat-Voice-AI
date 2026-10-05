"use client";

import { useRef, useState } from "react";
import { Language, StructuredAnswer } from "@/lib/types";
import { uploadDocument } from "@/lib/api";
import LanguageSelector from "./LanguageSelector";
import SchemeCard from "./SchemeCard";

export default function DocumentUploader() {
  const [language, setLanguage] = useState<Language>("en");
  const [status, setStatus] = useState<"idle" | "uploading" | "error" | "done">("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState<StructuredAnswer | null>(null);
  const [filename, setFilename] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setStatus("uploading");
    setError("");
    setFilename(file.name);
    try {
      const res = await uploadDocument(file, language);
      setResult(res.explanation);
      setStatus("done");
    } catch (e: any) {
      setError(e.message || "Could not process this document. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div className="glass rounded-2xl p-5 border border-white/5">
      <h3 className="font-display font-semibold mb-1">Explain a Government Notification</h3>
      <p className="text-sm text-mist mb-4">
        Upload a notification (PDF, TXT, or scanned image) and get a plain-language explanation.
      </p>

      <div className="mb-4">
        <div className="text-xs text-mist mb-2">Explain in</div>
        <LanguageSelector value={language} onChange={setLanguage} compact />
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.txt,.png,.jpg,.jpeg"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      <button
        onClick={() => inputRef.current?.click()}
        className="w-full rounded-xl border border-dashed border-white/15 py-8 text-sm text-mist hover:border-saffron/40 hover:text-bone transition"
      >
        {status === "uploading" ? `Processing ${filename}…` : "Click to upload a document"}
      </button>

      {status === "error" && (
        <div className="mt-4 text-sm text-red-300 glass rounded-xl p-3 border border-red-400/20">
          {error}
          <button onClick={() => inputRef.current?.click()} className="ml-2 underline">
            Retry
          </button>
        </div>
      )}

      {status === "done" && result && (
        <div className="mt-5">
          <SchemeCard answer={result} sources={[]} />
        </div>
      )}
    </div>
  );
}
