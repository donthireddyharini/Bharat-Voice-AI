import { NextResponse } from "next/server";
import { ALL_SCHEMES } from "@/lib/knowledgeData";
import { CategoryItem } from "@/lib/types";

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

const CATEGORY_META: Record<string, { icon: string; description: string }> = {
  Education: { icon: "🎓", description: "Schools, higher education and student support programs." },
  Agriculture: { icon: "🌾", description: "Farmer income support, insurance and input subsidies." },
  Employment: { icon: "💼", description: "Skilling programs and self-employment credit support." },
  "Government Services": { icon: "🏛", description: "Identity, certificates and citizen service processes." },
  Welfare: { icon: "👨‍👩‍👧", description: "Health cover and social security for vulnerable groups." },
  Scholarships: { icon: "📚", description: "Merit and need-based scholarships for students." },
  Documents: { icon: "📄", description: "Upload a notification for a plain-language explanation." },
  "Public Information": { icon: "🔎", description: "General public-service procedures and notifications." },
};

export async function GET() {
  const counts: Record<string, number> = {};
  for (const s of ALL_SCHEMES) {
    counts[s.category] = (counts[s.category] || 0) + 1;
  }

  const items: CategoryItem[] = Object.entries(CATEGORY_META).map(([name, meta]) => ({
    key: name.toLowerCase().replace(/ /g, "_"),
    label: name,
    icon: meta.icon,
    description: meta.description,
    doc_count: counts[name] || 0,
  }));

  return NextResponse.json(items, { headers: CORS_HEADERS });
}
