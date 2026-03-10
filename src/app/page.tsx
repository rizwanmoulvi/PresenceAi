"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Globe,
  Building2,
  Layers,
  Tag,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  OpenAILogo,
  AnthropicLogo,
  GeminiLogo,
  PerplexityLogo,
  GrokLogo,
} from "@/components/BrandLogos";

const INDUSTRIES = [
  "Technology & Software",
  "Financial Services",
  "Healthcare & Life Sciences",
  "E-Commerce & Retail",
  "Marketing & Advertising",
  "Education & EdTech",
  "Real Estate",
  "Manufacturing",
  "Consulting & Professional Services",
  "Media & Entertainment",
  "Logistics & Supply Chain",
  "Travel & Hospitality",
  "Legal Services",
  "Non-Profit",
  "Other",
];

const AI_MODELS = [
  { id: "chatgpt", name: "ChatGPT-4o", Logo: OpenAILogo },
  { id: "claude", name: "Claude 3.5", Logo: AnthropicLogo },
  { id: "gemini", name: "Gemini 1.5", Logo: GeminiLogo },
  { id: "perplexity", name: "Perplexity", Logo: PerplexityLogo },
  { id: "grok", name: "Grok 2", Logo: GrokLogo },
];

const STEPS = [
  { id: 1, label: "Company", icon: Building2 },
  { id: 2, label: "Industry", icon: Tag },
  { id: 3, label: "Market", icon: Globe },
  { id: 4, label: "Products", icon: Layers },
];

export default function HomePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    companyName: "",
    industry: "",
    geography: "",
    products: "",
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const canNext = () => {
    if (step === 1) return form.companyName.trim().length >= 2;
    if (step === 2) return form.industry.trim().length >= 2;
    if (step === 3) return form.geography.trim().length >= 2;
    if (step === 4) return form.products.trim().length >= 2;
    return false;
  };

  const handleSubmit = async () => {
    if (!canNext()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed to start analysis");

      const data = await res.json();
      router.push(`/analyzing/${data.id}`);
    } catch {
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else handleSubmit();
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && canNext()) handleNext();
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] overflow-hidden">

      {/* ── LEFT PANEL ── */}
      <div className="flex-1 flex flex-col px-8 pt-[2vh] pb-4 lg:max-w-[50%] lg:px-14 lg:pt-[4vh] lg:pb-6">

        {/* Model badges */}
        <motion.div
          className="flex items-center gap-2 flex-wrap mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {AI_MODELS.map(({ id, name, Logo }) => (
            <div
              key={id}
              className="flex items-center gap-1.5 rounded-lg border border-alabaster-grey-200 bg-white px-3 py-1.5 text-xs text-alabaster-grey-700"
            >
              <Logo className="h-3.5 w-3.5 text-alabaster-grey-500" />
              <span className="font-medium">{name}</span>
            </div>
          ))}
        </motion.div>

        {/* Hero heading — serif display font */}
        <motion.h1
          className="font-serif text-[2rem] leading-[1.15] font-normal text-alabaster-grey-900 mb-3 lg:text-[3.25rem] lg:leading-[1.1]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
        >
          How does AI{" "}
          <span className="italic text-steel-blue-600">see</span>{" "}
          your brand?
        </motion.h1>

        {/* Subheading */}
        <motion.p
          className="text-[1.075rem] text-alabaster-grey-600 leading-relaxed max-w-[540px] mb-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Get your free GEO score — discover how ChatGPT, Claude, Gemini,
          Perplexity, and Grok describe your company and where you rank.
        </motion.p>

        {/* Step indicator */}
        <motion.div
          className="flex items-center gap-0 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isCompleted = s.id < step;
            const isActive = s.id === step;
            return (
              <div key={s.id} className="flex items-center flex-1 min-w-0">
                <div className="flex flex-col items-center shrink-0">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                      isCompleted
                        ? "border-steel-blue-600 bg-steel-blue-600"
                        : isActive
                        ? "border-steel-blue-500 bg-steel-blue-50"
                        : "border-alabaster-grey-200 bg-white"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                    ) : (
                      <Icon
                        className={`h-3.5 w-3.5 ${
                          isActive ? "text-steel-blue-600" : "text-alabaster-grey-400"
                        }`}
                      />
                    )}
                  </div>
                  <span
                    className={`mt-1 text-[10px] font-medium tracking-wide ${
                      isActive ? "text-steel-blue-600" : isCompleted ? "text-alabaster-grey-400" : "text-alabaster-grey-400"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-px mx-2 transition-all duration-500 mb-4 ${
                      isCompleted ? "bg-steel-blue-500" : "bg-alabaster-grey-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </motion.div>

        {/* Form Card */}
        <motion.div
          className="rounded-2xl border border-alabaster-grey-200 bg-white shadow-md overflow-hidden"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
        >
          <div className="p-5">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.22 }}
                >
                  <h2 className="text-[1.375rem] font-semibold text-alabaster-grey-900 mb-1">
                    What&apos;s your company name?
                  </h2>
                  <p className="text-alabaster-grey-500 text-sm mb-5">
                    We&apos;ll analyze how AI models describe your brand.
                  </p>
                  <input
                    autoFocus
                    type="text"
                    className="w-full text-base py-3.5"
                    placeholder="e.g. Acme Corp, TechFlow AI..."
                    value={form.companyName}
                    onChange={(e) => update("companyName", e.target.value)}
                    onKeyDown={handleKey}
                  />
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.22 }}
                >
                  <h2 className="text-[1.375rem] font-semibold text-alabaster-grey-900 mb-1">
                    What industry are you in?
                  </h2>
                  <p className="text-alabaster-grey-500 text-sm mb-5">
                    We&apos;ll benchmark against your industry peers.
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 max-h-56 overflow-y-auto pr-1 custom-scroll mb-3">
                    {INDUSTRIES.map((ind) => (
                      <button
                        key={ind}
                        onClick={() => update("industry", ind)}
                        className={`text-left px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all duration-150 ${
                          form.industry === ind
                            ? "border-steel-blue-500 bg-steel-blue-50 text-steel-blue-700"
                            : "border-alabaster-grey-200 bg-white text-alabaster-grey-700 hover:border-steel-blue-300 hover:text-alabaster-grey-900"
                        }`}
                      >
                        {ind}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    className="w-full text-sm py-2.5"
                    placeholder="Or type your industry..."
                    value={INDUSTRIES.includes(form.industry) ? "" : form.industry}
                    onChange={(e) => update("industry", e.target.value)}
                    onKeyDown={handleKey}
                  />
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.22 }}
                >
                  <h2 className="text-[1.375rem] font-semibold text-alabaster-grey-900 mb-1">
                    Where do you operate?
                  </h2>
                  <p className="text-alabaster-grey-500 text-sm mb-5">
                    Your primary market helps us provide localised insights.
                  </p>
                  <input
                    autoFocus
                    type="text"
                    className="w-full text-base py-3.5"
                    placeholder="e.g. United States, Europe, Global..."
                    value={form.geography}
                    onChange={(e) => update("geography", e.target.value)}
                    onKeyDown={handleKey}
                  />
                  <div className="flex flex-wrap gap-2 mt-3">
                    {["United States", "Europe", "Asia Pacific", "Global", "India", "UK"].map(
                      (geo) => (
                        <button
                          key={geo}
                          onClick={() => update("geography", geo)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                            form.geography === geo
                              ? "border-steel-blue-500 bg-steel-blue-50 text-steel-blue-700"
                              : "border-alabaster-grey-200 bg-white text-alabaster-grey-600 hover:border-steel-blue-300"
                          }`}
                        >
                          {geo}
                        </button>
                      )
                    )}
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.22 }}
                >
                  <h2 className="text-[1.375rem] font-semibold text-alabaster-grey-900 mb-1">
                    What do you sell?
                  </h2>
                  <p className="text-alabaster-grey-500 text-sm mb-5">
                    Describe your main products or services briefly.
                  </p>
                  <textarea
                    autoFocus
                    className="w-full h-28 resize-none text-base"
                    placeholder="e.g. B2B CRM software, marketing automation, data analytics..."
                    value={form.products}
                    onChange={(e) => update("products", e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.metaKey && canNext())
                        handleSubmit();
                    }}
                  />
                  <p className="text-xs text-alabaster-grey-400 mt-1">
                    Press ⌘ + Enter to analyze
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer nav */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-alabaster-grey-100">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              className={`btn-ghost text-sm ${step === 1 ? "invisible" : ""}`}
            >
              Back
            </button>
            <div className="flex items-center gap-3">
              <span className="text-xs text-alabaster-grey-400">
                {step} / {STEPS.length}
              </span>
              <button
                onClick={handleNext}
                disabled={!canNext() || loading}
                className="btn-primary gap-2 py-2.5 px-5"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Starting...
                  </>
                ) : step === 4 ? (
                  <>
                    Analyze My Brand
                    <ArrowRight className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Disclaimer */}
        <p className="mt-4 text-xs text-alabaster-grey-400 leading-relaxed">
          Free analysis &middot; No credit card required &middot; Results in under 2 minutes
        </p>
      </div>

      {/* ── RIGHT PANEL (desktop only) ── */}
      <div className="hidden lg:flex flex-1 relative flex-col items-center justify-center overflow-hidden bg-soft-linen-50 border-l border-alabaster-grey-200">

        {/* Background radial decoration */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-steel-blue-100/60 blur-[100px]" />
          <div className="absolute bottom-0 right-0 h-[300px] w-[300px] rounded-full bg-mint-cream-100/40 blur-[80px]" />
        </div>

        {/* Network / AI Visualization SVG */}
        <motion.div
          className="relative z-10 mb-10 w-full max-w-xs px-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
        >
          <svg viewBox="0 0 320 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto opacity-80">
            {/* Connection lines */}
            <line x1="160" y1="140" x2="60" y2="60" stroke="#554257" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="160" y1="140" x2="260" y2="60" stroke="#554257" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="160" y1="140" x2="40" y2="190" stroke="#554257" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="160" y1="140" x2="280" y2="190" stroke="#554257" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="160" y1="140" x2="160" y2="248" stroke="#554257" strokeWidth="1" strokeDasharray="4 4" />

            {/* Center node — brand */}
            <circle cx="160" cy="140" r="30" fill="#1c161d" stroke="#8e6e91" strokeWidth="1.5" />
            <circle cx="160" cy="140" r="36" fill="none" stroke="#8e6e91" strokeWidth="0.5" strokeDasharray="2 3" />
            <text x="160" y="136" textAnchor="middle" fill="#c3bda3" fontSize="8" fontFamily="Lexend Deca,sans-serif" fontWeight="600">YOUR</text>
            <text x="160" y="148" textAnchor="middle" fill="#c3bda3" fontSize="8" fontFamily="Lexend Deca,sans-serif" fontWeight="600">BRAND</text>

            {/* ChatGPT node */}
            <circle cx="60" cy="60" r="22" fill="#1a191a" stroke="#4e4a4f" strokeWidth="1" />
            <text x="60" y="56" textAnchor="middle" fill="#867984" fontSize="7" fontFamily="Lexend Deca,sans-serif">ChatGPT</text>
            <text x="60" y="67" textAnchor="middle" fill="#5c573d" fontSize="6" fontFamily="Lexend Deca,sans-serif">4o</text>

            {/* Claude node */}
            <circle cx="260" cy="60" r="22" fill="#1a191a" stroke="#4e4a4f" strokeWidth="1" />
            <text x="260" y="56" textAnchor="middle" fill="#867984" fontSize="7" fontFamily="Lexend Deca,sans-serif">Claude</text>
            <text x="260" y="67" textAnchor="middle" fill="#5c573d" fontSize="6" fontFamily="Lexend Deca,sans-serif">3.5</text>

            {/* Gemini node */}
            <circle cx="40" cy="190" r="22" fill="#1a191a" stroke="#4e4a4f" strokeWidth="1" />
            <text x="40" y="186" textAnchor="middle" fill="#867984" fontSize="7" fontFamily="Lexend Deca,sans-serif">Gemini</text>
            <text x="40" y="197" textAnchor="middle" fill="#5c573d" fontSize="6" fontFamily="Lexend Deca,sans-serif">1.5</text>

            {/* Perplexity node */}
            <circle cx="280" cy="190" r="22" fill="#1a191a" stroke="#4e4a4f" strokeWidth="1" />
            <text x="280" y="186" textAnchor="middle" fill="#867984" fontSize="6" fontFamily="Lexend Deca,sans-serif">Perplexity</text>
            <text x="280" y="197" textAnchor="middle" fill="#5c573d" fontSize="6" fontFamily="Lexend Deca,sans-serif">AI</text>

            {/* Grok node */}
            <circle cx="160" cy="248" r="22" fill="#1a191a" stroke="#4e4a4f" strokeWidth="1" />
            <text x="160" y="244" textAnchor="middle" fill="#867984" fontSize="7" fontFamily="Lexend Deca,sans-serif">Grok</text>
            <text x="160" y="255" textAnchor="middle" fill="#5c573d" fontSize="6" fontFamily="Lexend Deca,sans-serif">2</text>

            {/* Pulse rings on center */}
            <circle cx="160" cy="140" r="44" fill="none" stroke="#8e6e91" strokeWidth="0.5" opacity="0.3" />
            <circle cx="160" cy="140" r="54" fill="none" stroke="#8e6e91" strokeWidth="0.5" opacity="0.15" />
          </svg>
        </motion.div>

        {/* Quote */}
        <motion.blockquote
          className="relative z-10 max-w-sm px-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <p className="text-[1rem] text-alabaster-grey-600 leading-relaxed font-light italic mb-6">
            &ldquo;In the AI era, brand visibility isn&rsquo;t just about search rankings — it&rsquo;s about how large language models perceive and represent your company.&rdquo;
          </p>
          <div className="flex items-center justify-center gap-3">
            <div className="h-8 w-8 rounded-full bg-steel-blue-100 border border-steel-blue-200 flex items-center justify-center">
              <span className="text-xs font-semibold text-steel-blue-600">GEO</span>
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-alabaster-grey-800">PresenceAI</p>
              <p className="text-xs text-alabaster-grey-500">Generative Engine Optimization</p>
            </div>
          </div>
        </motion.blockquote>

        {/* Score preview pills */}
        <motion.div
          className="relative z-10 mt-10 flex flex-col gap-2 px-10 w-full max-w-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          {[
            { label: "Brand Mentions", value: "—", note: "across 5 models" },
            { label: "Sentiment Score", value: "—", note: "per AI response" },
            { label: "Visibility Rank", value: "—", note: "in your category" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-xl border border-alabaster-grey-200 bg-white px-4 py-3"
            >
              <div>
                <p className="text-xs font-medium text-alabaster-grey-700">{item.label}</p>
                <p className="text-[10px] text-alabaster-grey-400">{item.note}</p>
              </div>
              <span className="text-sm font-semibold text-alabaster-grey-400 font-mono">{item.value}</span>
            </div>
          ))}
          <p className="text-center text-[10px] text-alabaster-grey-400 mt-1">
            Fill in the form to unlock your scores
          </p>
        </motion.div>
      </div>
    </div>
  );
}
