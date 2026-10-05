"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Interactive3DScene from "@/components/Interactive3DScene";

const FEATURES = [
  {
    icon: "🗣️",
    title: "Voice-First Multilingual Access",
    desc: "Speak naturally in your mother tongue — Telugu, Hindi, Kannada, or English. Designed especially for citizens who cannot read or write English.",
  },
  {
    icon: "🛡️",
    title: "100% RAG Grounded Facts",
    desc: "Every answer is cross-referenced with official central and state government scheme documents. Zero hallucinated eligibility criteria.",
  },
  {
    icon: "📄",
    title: "Government Document Explainer",
    desc: "Upload complex government Gazette orders, PDFs, or circulars to get simplified, plain-language summaries with required documents list.",
  },
  {
    icon: "🎙️",
    title: "Studio-Quality Neural Voices",
    desc: "Powered by Neural Indian voice engines delivering authentic native pronunciation, regional inflection, and natural conversational cadence.",
  },
  {
    icon: "⚡",
    title: "Fast Sub-Second Vector Retrieval",
    desc: "Multilingual sentence embeddings coupled with FAISS vector indexing ensure immediate, accurate scheme matching even for code-switched queries.",
  },
  {
    icon: "🔐",
    title: "Citizen Privacy & Google OAuth",
    desc: "Secure authentication using Google OAuth ensures your saved schemes and profile information remain private and protected.",
  },
];

const DOMAINS = [
  { name: "Education & Scholarships", icon: "🎓", count: "3+ Schemes", example: "National Means-cum-Merit Scholarship, Post-Matric" },
  { name: "Agriculture & Farmers", icon: "🌾", count: "2+ Schemes", example: "PM-KISAN Samman Nidhi, Crop Insurance" },
  { name: "Welfare & Health", icon: "🏥", count: "2+ Schemes", example: "Ayushman Bharat PM-JAY, Social Security" },
  { name: "Employment & Skilling", icon: "💼", count: "2+ Schemes", example: "PM Employment Generation, Skill India" },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-transparent text-bone relative overflow-hidden flex flex-col">
      <Navbar />

      {/* Hero Header */}
      <section className="relative pt-20 pb-16 px-6 max-w-7xl mx-auto w-full text-center">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass border border-saffron/30 text-xs text-bone mb-6 shadow-glow">
          <span className="w-2 h-2 rounded-full bg-saffron animate-pulse" />
          <span>About BharathVoice AI • Multilingual Citizen Platform</span>
        </div>

        <h1 className="font-display text-4xl md:text-6xl font-black mb-6">
          Empowering Bharat with{" "}
          <span className="text-gradient">Voice-First AI</span>
        </h1>

        <p className="max-w-3xl mx-auto text-base md:text-xl text-mist leading-relaxed mb-10">
          Over 60% of India&apos;s population struggles to navigate English-heavy government portals.
          BharathVoice AI breaks the language barrier by allowing every citizen to speak, understand,
          and claim their rightful public welfare schemes in their mother tongue.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/assistant"
            className="px-8 py-3.5 rounded-full bg-gradient-to-r from-saffron via-gulal to-amethyst text-white font-bold text-base shadow-glow hover:scale-105 transition-all"
          >
            Launch Assistant →
          </Link>
          <Link
            href="/dashboard"
            className="px-8 py-3.5 rounded-full glass text-bone font-semibold text-base border border-white/10 hover:border-saffron/40 hover:bg-white/5 transition-all"
          >
            Browse Services
          </Link>
        </div>
      </section>

      {/* 3D Visual Section */}
      <section className="px-6 max-w-6xl mx-auto w-full mb-20">
        <div className="glass-strong rounded-3xl p-6 md:p-10 border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="text-xs font-bold text-cyber uppercase tracking-wider">Mission & Architecture</span>
              <h2 className="font-display text-2xl md:text-3xl font-bold mt-2 mb-4 text-bone">
                Why BharathVoice AI Matters
              </h2>
              <p className="text-sm md:text-base text-mist leading-relaxed mb-4">
                Government schemes like PM-KISAN, National Scholarships, and Ayushman Bharat allocate lakhs of crores
                annually, yet eligible families miss out simply because information is trapped in complex PDFs and bureaucratic portals.
              </p>
              <p className="text-sm md:text-base text-mist leading-relaxed">
                BharathVoice AI ingests official policy documents into a high-speed vector database. When a farmer or student
                asks a question in Telugu, Hindi, or Kannada, our semantic retrieval pipeline extracts verified eligibility criteria
                and articulates the steps clearly using human-like neural voices.
              </p>
            </div>

            <div className="h-[320px] rounded-2xl glass border border-white/10 relative overflow-hidden">
              <Interactive3DScene interactive={true} showLabels={true} />
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="px-6 max-w-7xl mx-auto w-full mb-20">
        <h2 className="font-display text-3xl font-bold text-center mb-12 text-bone">
          Core Capabilities
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="glass rounded-2xl p-6 border border-white/10 hover:border-saffron/40 hover:-translate-y-1 transition-all duration-300 shadow-lg"
            >
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="font-display font-semibold text-lg mb-2 text-bone">{f.title}</h3>
              <p className="text-sm text-mist leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Domains Covered */}
      <section className="px-6 max-w-7xl mx-auto w-full mb-24">
        <h2 className="font-display text-3xl font-bold text-center mb-12 text-bone">
          Supported Public Domains
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {DOMAINS.map((d, i) => (
            <div key={i} className="glass-strong rounded-2xl p-6 border border-white/10 flex flex-col justify-between">
              <div>
                <span className="text-3xl mb-3 block">{d.icon}</span>
                <h3 className="font-display font-semibold text-base text-bone mb-1">{d.name}</h3>
                <span className="text-xs text-saffron font-medium">{d.count}</span>
                <p className="text-xs text-mist mt-3">{d.example}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
