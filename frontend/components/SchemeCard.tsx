import { StructuredAnswer, SourceRef, Language } from "@/lib/types";
import SourceCard from "./SourceCard";
import { getLocalizedScheme, getUIText } from "@/lib/schemeLocalization";

interface SchemeCardProps {
  answer: StructuredAnswer;
  sources: SourceRef[];
  language?: Language;
}

export default function SchemeCard({ answer, sources, language = "en" }: SchemeCardProps) {
  const ui = getUIText(language);
  const localized = answer.scheme_id ? getLocalizedScheme(answer.scheme_id, language) : null;

  const schemeName = localized?.title || answer.scheme_name;
  const summary = localized?.summary || answer.summary;
  const eligibility = localized?.eligibility && localized.eligibility.length > 0 ? localized.eligibility : answer.eligibility;
  const benefits = localized?.benefits && localized.benefits.length > 0 ? localized.benefits : answer.benefits;
  const documentsRequired = localized?.documents_required && localized.documents_required.length > 0 ? localized.documents_required : answer.documents_required;
  const applicationSteps = localized?.application_steps && localized.application_steps.length > 0 ? localized.application_steps : answer.application_steps;

  const isWeather = answer.scheme_id === "weather-realtime";
  const isRural = answer.scheme_id === "rural-advisory";
  const isCivic = answer.scheme_id === "civic-advisory";
  const isGeneralAI = answer.scheme_id?.startsWith("ai-") || answer.scheme_id?.startsWith("global-");
  const isGovScheme = !isWeather && !isRural && !isCivic && !isGeneralAI;

  const getBadgeTitle = () => {
    if (isWeather) {
      if (language === "te") return "రియల్ టైమ్ వాతావరణ సమాచారం & తుఫాను హెచ్చరిక";
      if (language === "hi") return "वास्तविक समय मौसम एवं चक्रवात सलाह";
      if (language === "ta") return "நேரலை வானிலை & புயல் எச்சரிக்கை";
      if (language === "kn") return "ನೈಜ ಸಮಯದ ಹವಾಮಾನ ಮತ್ತು ಚಂಡಮಾರುತ ಸಲಹೆ";
      return "Real-Time Weather & Cyclone Advisory";
    }
    if (isRural) {
      if (language === "te") return "ధృవీకరించిన వ్యవసాయ & గ్రామీణ సలహా";
      if (language === "hi") return "सत्यापित कृषि एवं ग्रामीण सलाह";
      if (language === "ta") return "சரிபார்க்கப்பட்ட வேளாண்மை & கிராமப்புற ஆலோசனை";
      if (language === "kn") return "ಪರಿಶೀಲಿಸಿದ ಕೃಷಿ ಮತ್ತು ಗ್ರಾಮೀಣ ಸಲಹೆ";
      return "Verified Agricultural & Rural Advisory";
    }
    if (isCivic) {
      if (language === "te") return "ప్రజాస్వామ్య & పౌర సమాచారం";
      if (language === "hi") return "लोकतांत्रिक एवं नागरिक सेवा विवरण";
      return "Civic & Governance Services";
    }
    if (isGeneralAI) {
      if (language === "te") return "ధృవీకరించిన సమాచారం";
      if (language === "hi") return "सत्यापित नागरिक मार्गदर्शन";
      if (language === "ta") return "சரிபார்க்கப்பட்ட குடிமக்கள் வழிகாட்டுதல்";
      if (language === "kn") return "ಪರಿಶೀಲಿಸಿದ ನಾಗರಿಕ ಮಾರ್ಗದರ್ಶನ";
      return "Verified Citizen Guidance";
    }
    return ui.ai_answer;
  };

  const getSection1Title = () => {
    if (isWeather) {
      if (language === "te") return "ప్రస్తుత పరిశీలనలు (Live Observations)";
      if (language === "hi") return "वर्तमान मौसम अवलोकन";
      return "Current Live Observations";
    }
    if (isRural) {
      if (language === "te") return "సిఫార్సు చేసిన నివారణ చర్యలు (Recommended Measures)";
      if (language === "hi") return "अनुशंसित उपाय एवं उपचार";
      return "Recommended Actions & Remedies";
    }
    if (isGeneralAI) {
      if (language === "te") return "ముఖ్య వివరాలు (Key Highlights)";
      if (language === "hi") return "मुख्य बिंदु";
      return "Key Highlights";
    }
    return ui.who_can_apply;
  };

  const getSection2Title = () => {
    if (isWeather) {
      if (language === "te") return "రైతులు & పౌరుల సూచనలు (Farmer & Citizen Precautions)";
      if (language === "hi") return "किसान एवं नागरिक सावधानियां";
      return "Farmer & Citizen Precautions";
    }
    if (isRural) {
      if (language === "te") return "ముఖ్య ప్రయోజనాలు & సూచనలు";
      if (language === "hi") return "मुख्य लाभ एवं सावधानियां";
      return "Key Benefits & Guidelines";
    }
    if (isGeneralAI) {
      if (language === "te") return "అదనపు సమాచారం (Additional Details)";
      if (language === "hi") return "अतिरिक्त विवरण";
      return "Additional Details";
    }
    return ui.benefits;
  };

  if (!answer.grounded) {
    return (
      <div className="glass rounded-2xl p-6 border border-amethyst/30 shadow-glow3D animate-fade-in transition-all">
        <p className="text-sm leading-relaxed text-bone">{summary}</p>
      </div>
    );
  }

  return (
    <div className="w-full animate-fadeIn">
      <div className="glass-strong rounded-2xl overflow-hidden border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.4)] backdrop-blur-2xl transition-all duration-300 hover:border-saffron/40 hover:shadow-glow3D relative">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        
        {schemeName && (
          <div className="px-6 py-5 bg-gradient-to-r from-saffron/20 via-gulal/15 to-amethyst/20 border-b border-white/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:250%_250%,100%_100%] animate-[bg-shift_3s_linear_infinite]" />
            <div className="relative z-10">
              <div className="text-[11px] font-bold uppercase tracking-widest text-mist mb-1 drop-shadow-sm">
                {getBadgeTitle()}
              </div>
              <h3 className="font-display font-bold text-xl text-bone drop-shadow-md">{schemeName}</h3>
            </div>
          </div>
        )}

        <div className="p-6 space-y-6 text-sm relative z-10">
          <p className="text-bone/95 leading-relaxed text-base">{summary}</p>

          {eligibility.length > 0 && (
            <Section title={getSection1Title()}>
              <ul className="space-y-2">
                {eligibility.map((item, i) => (
                  <li key={i} className="flex gap-3 text-mist/90 bg-white/5 p-2 rounded-lg border border-white/5 hover:border-saffron/30 transition-colors">
                    <span className="text-saffron font-bold text-lg leading-none mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {benefits.length > 0 && (
            <Section title={getSection2Title()}>
              <ul className="space-y-2">
                {benefits.map((item, i) => (
                  <li key={i} className="flex gap-3 text-mist/90 bg-white/5 p-2 rounded-lg border border-white/5 hover:border-gulal/30 transition-colors">
                    <span className="text-gulal font-bold text-lg leading-none mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {isGovScheme && documentsRequired.length > 0 && (
            <Section title={ui.documents_required}>
              <ul className="grid sm:grid-cols-2 gap-2">
                {documentsRequired.map((item, i) => (
                  <li key={i} className="flex gap-2 text-mist/90 text-sm bg-black/20 p-2.5 rounded-lg border border-white/5 hover:border-amethyst/30 transition-colors">
                    <span className="text-amethyst font-bold text-lg leading-none">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {isGovScheme && applicationSteps.length > 0 && (
            <Section title={ui.how_to_apply}>
              <ol className="space-y-2">
                {applicationSteps.map((item, i) => (
                  <li key={i} className="flex gap-3 text-mist/90 bg-white/5 p-2.5 rounded-lg border border-white/5">
                    <span className="text-bone/80 font-bold bg-white/10 w-6 h-6 rounded-full flex items-center justify-center shrink-0">{i + 1}</span>
                    <span className="mt-0.5">{item}</span>
                  </li>
                ))}
              </ol>
            </Section>
          )}
        </div>

        {sources.length > 0 && (
          <div className="px-6 pb-6 grid gap-3 relative z-10">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-2" />
            {sources.map((s) => (
              <SourceCard key={s.doc_id} source={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="animate-fade-in" style={{ animationFillMode: 'both' }}>
      <div className="text-xs font-bold uppercase tracking-wider text-bone/60 mb-3 flex items-center gap-2">
        {title}
        <div className="flex-1 h-px bg-white/10" />
      </div>
      {children}
    </div>
  );
}
