"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import BrandLogo from "@/components/BrandLogo";
import CategoryCard from "@/components/CategoryCard";
import { fetchCategories } from "@/lib/api";
import { CategoryItem } from "@/lib/types";
import { useAuth } from "@/lib/auth";

const VERIFIED_PORTALS = [
  { name: "National Scholarship Portal", url: "https://scholarships.gov.in", tag: "Scholarships", icon: "🎓" },
  { name: "PM-KISAN Samman Nidhi", url: "https://pmkisan.gov.in", tag: "Agriculture", icon: "🌾" },
  { name: "Ayushman Bharat PM-JAY", url: "https://nha.gov.in", tag: "Healthcare", icon: "🏥" },
  { name: "UIDAI Aadhaar Portal", url: "https://uidai.gov.in", tag: "Citizen Identity", icon: "🆔" },
  { name: "National Career Service", url: "https://ncs.gov.in", tag: "Employment", icon: "💼" },
  { name: "Ministry of Social Justice", url: "https://socialjustice.gov.in", tag: "Social Welfare", icon: "🤝" },
];

export default function ServicesPage() {
  const { logout } = useAuth();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {});
  }, []);

  const filteredCategories = categories.filter((c) => {
    const matchesSearch =
      c.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === "all" || c.key.toLowerCase().includes(selectedTag.toLowerCase());
    return matchesSearch && matchesTag;
  });

  return (
    <div className="flex min-h-screen bg-transparent text-bone relative overflow-hidden">
      <div className="relative z-10">
        <Sidebar />
      </div>

      <main className="flex-1 px-3 sm:px-8 py-4 sm:py-6 max-w-6xl mx-auto relative z-10 min-h-screen overflow-y-auto">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between gap-2.5 mb-6 pb-3 border-b border-white/8">
          <div className="flex items-center gap-2.5">
            <Link href="/" className="md:hidden block shrink-0">
              <BrandLogo size="sm" showText={false} />
            </Link>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full glass border border-saffron/30 text-[10px] text-saffron font-semibold mb-0.5">
                <span>🏛️ Official Public Directory</span>
              </div>
              <h1 className="font-display font-bold text-lg sm:text-2xl md:text-3xl text-bone">Explore Services</h1>
              <p className="text-mist text-[11px] sm:text-sm mt-0.5 hidden xs:block">
                Verified public welfare, student scholarships, and citizen schemes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3">
            <Link
              href="/"
              className="flex items-center gap-1 px-3 py-1.5 rounded-full glass border border-white/15 text-xs font-semibold text-bone hover:border-saffron/40 hover:bg-white/5 active:scale-95 transition-all shadow-sm"
            >
              <span>🏠</span>
              <span className="hidden sm:inline">Home</span>
            </Link>
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full glass border border-red-500/20 text-xs font-semibold text-red-200 hover:bg-red-500/10 hover:border-red-500/40 active:scale-95 transition-all cursor-pointer shadow-sm"
            >
              <span>🚪</span>
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="glass-strong rounded-2xl p-5 border border-white/8 mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-mist text-base">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search schemes by name, keyword, or requirement (e.g. scholarship, farmer, pension)..."
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/30 border border-white/10 text-sm text-bone placeholder-mist/60 focus:outline-none focus:border-saffron/50 transition-colors"
              />
            </div>
            <Link
              href="/assistant"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-saffron to-gulal text-white text-xs font-bold shadow-glow hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 shrink-0"
            >
              <span>🎙️ Ask AI by Voice</span>
              <span>→</span>
            </Link>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none text-xs">
            <span className="text-mist/70 text-[11px] font-semibold uppercase tracking-wider mr-1">Filter:</span>
            {[
              { id: "all", label: "All Schemes" },
              { id: "scholarship", label: "🎓 Scholarships" },
              { id: "farmer", label: "🌾 Agriculture" },
              { id: "health", label: "🏥 Health" },
              { id: "welfare", label: "🤝 Welfare" },
              { id: "employment", label: "💼 Employment" },
            ].map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => setSelectedTag(tag.id)}
                className={`px-3 py-1.5 rounded-full border transition-all duration-200 whitespace-nowrap font-medium ${
                  selectedTag === tag.id
                    ? "bg-saffron/20 border-saffron/50 text-saffron font-bold shadow-glow"
                    : "glass border-white/10 text-mist hover:text-bone hover:border-white/20"
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scheme Categories Grid */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-lg text-bone flex items-center gap-2">
              <span>Public Service Categories</span>
              <span className="text-xs text-saffron glass px-2.5 py-0.5 rounded-full border border-saffron/30">
                {filteredCategories.length} Available
              </span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredCategories.map((c) => (
              <Link
                key={c.key}
                href={`/assistant?category=${c.key}`}
                className="block transition-all duration-500 hover:-translate-y-2 active:scale-[0.96] focus:outline-none"
              >
                <div className="h-full">
                  <CategoryCard category={c} />
                </div>
              </Link>
            ))}
          </div>

          {filteredCategories.length === 0 && (
            <div className="glass rounded-2xl p-10 text-center border border-white/10 space-y-3">
              <span className="text-3xl">🔍</span>
              <p className="text-bone font-medium">No services match your search &quot;{searchQuery}&quot;</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedTag("all");
                }}
                className="text-xs text-saffron underline hover:text-saffron-light"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Verified Government Registries Links */}
        <div className="glass-strong rounded-2xl p-6 border border-emerald-500/20 mb-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-emerald-400 font-bold text-sm">✓ Grounded Registries</span>
            <span className="text-[10px] text-mist px-2 py-0.5 rounded-full glass border border-emerald-500/30">Official Government Portals</span>
          </div>
          <h3 className="font-display font-bold text-base text-bone mb-4">
            Official Portals Used by BharathVoice AI for Fact Verification
          </h3>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {VERIFIED_PORTALS.map((portal) => (
              <a
                key={portal.name}
                href={portal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="glass p-3.5 rounded-xl border border-white/8 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all duration-300 flex items-center justify-between group active:scale-[0.98]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-lg shrink-0">{portal.icon}</span>
                  <div className="truncate">
                    <div className="text-xs font-semibold text-bone group-hover:text-emerald-300 transition-colors truncate">
                      {portal.name}
                    </div>
                    <div className="text-[10px] text-mist/70 truncate">{portal.url.replace("https://", "")}</div>
                  </div>
                </div>
                <span className="text-mist group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all text-xs ml-2 shrink-0">
                  ↗
                </span>
              </a>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
