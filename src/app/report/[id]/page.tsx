"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, ArrowRight, AlertTriangle, ExternalLink, TrendingUp, TrendingDown, Minus } from "lucide-react";
import toast from "react-hot-toast";
import type { ModelScore, Insight, Recommendation } from "@/lib/simulate";
import { AI_MODEL_LOGOS } from "@/components/BrandLogos";
import { cn } from "@/lib/utils";

// ── types ──────────────────────────────────────────────────────────────────────

interface ReportData {
  id: string;
  companyName: string;
  industry: string;
  geography: string;
  products: string;
  overallScore: number;
  modelScores: ModelScore[];
  insights: Insight[];
  recommendations: Recommendation[];
  unlocked: boolean;
  createdAt: string;
}

// ── helpers ────────────────────────────────────────────────────────────────────

function getSubScores(score: number) {
  return {
    brandRecognition: Math.round((score / 100) * 20),
    marketScore: Math.round((score / 100) * 10),
    presenceQuality: Math.round((score / 100) * 20),
    brandSentiment: Math.round((score / 100) * 40),
    shareOfVoice: Math.round((score / 100) * 10),
  };
}

function getScoreTagline(score: number): string {
  if (score >= 80) return "Strong Performer";
  if (score >= 65) return "Good Visibility";
  if (score >= 45) return "You're on the right track";
  if (score >= 25) return "Needs Improvement";
  return "Low AI Visibility";
}

function getMarketPosition(score: number): string {
  if (score >= 70) return "Leader";
  if (score >= 40) return "Challenger";
  return "Niche Player";
}

function getBrandArchetype(sentiment: ModelScore["sentiment"]): string {
  if (sentiment === "positive") return "Innovator";
  if (sentiment === "neutral") return "Traditionalist";
  return "Disruptor";
}

const MODEL_DESCS: Record<string, string> = {
  chatgpt: "ChatGPT",
  claude: "Anthropic AI",
  gemini: "Gemini",
  perplexity: "Perplexity",
  grok: "Grok",
};

// ── mock data generators ───────────────────────────────────────────────────────

function getMockShareOfVoice(companyName: string) {
  const competitors = ["Nike", "Adidas", "Puma", "Reebok", "Others"];
  const companyShare = 15;
  const rest = 85;
  const split = [25, 20, 18, 12, 10].map((v, i) => ({
    name: competitors[i],
    pct: v,
  }));
  return [{ name: companyName, pct: companyShare }, ...split];
}

const PALETTE = [
  "#2e6f9e", // steel-blue
  "#528547", // mint-cream
  "#d87941", // sandy-brown
  "#7c5cbf", // purple
  "#e05c6f", // red-pink
  "#e0a429", // amber
  "#888",    // grey
];

function getMarketCompetitionData(score: number) {
  const marketScore = Math.round((score / 100) * 10);
  return {
    score: marketScore,
    mentions: Math.round(score * 12 + 200),
    comparisonMentions: Math.round(score * 8 + 50),
    comparisonTopics: [
      "Pricing & affordability",
      "Product quality & durability",
      "Brand awareness",
      "Distribution network",
      "Target segment positioning",
    ],
  };
}

function getSentimentData(score: number) {
  const base = Math.round(50 + score * 0.5);
  return {
    totalScore: Math.min(100, base),
    general: {
      score: Math.min(100, Math.round(base * 0.95)),
      description: "Overall customer sentiment reflects satisfaction with product quality, design, and value.",
      keyFactors: ["Product quality", "Customer testimonials", "Industry reviews"],
    },
    contextual: {
      score: Math.min(100, Math.round(base * 1.02)),
      description: "Brand perception remains consistent across sector-specific discussions and targeted use cases.",
      keyFactors: ["Addresses specific customer needs", "Competitive pricing strategy", "Strong positioning in segment"],
    },
    sourceBased: {
      score: Math.min(100, Math.round(base * 0.98)),
      description: "Sentiment is consistently positive across reviews, publications, and third-party platforms.",
      keyFactors: ["4.8/5 stars on verified reviews", "Positive long-form YouTube reviews", "Industry publication recognition"],
    },
    polarization: {
      score: Math.round(100 - base * 0.3),
      description: "Low polarization indicates strong consensus with minimal negative sentiment.",
      insights: ["Consistent product quality messaging", "Effective marketing strategies", "Unified brand voice"],
    },
    sources: [
      { name: "Industry Publications", type: "Industry publication", score: 85, note: "Recognized as a strong performer in design and innovation." },
      { name: "Customer Reviews", type: "Online review aggregator", score: 78, note: "Customers consistently praise comfort, style, and value." },
      { name: "Social Media", type: "Social sentiment platform", score: Math.min(100, Math.round(base * 0.9)), note: "Positive brand conversations trending across major platforms." },
    ],
  };
}

// ── score arc gauge ────────────────────────────────────────────────────────────

const ARC_PATH = "M30,90 A40,40 0 1,1 80,90";
const ARC_TOTAL = 197.2;

function ScoreArc({ score }: { score: number }) {
  const offset = ARC_TOTAL * (1 - score / 100);
  const strokeColor =
    score >= 70 ? "#528547" : score >= 45 ? "#2e6f9e" : "#d87941";

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="5 15 100 90" className="w-28 h-24">
        {/* track */}
        <path
          d={ARC_PATH}
          fill="none"
          stroke="#e7e4e4"
          strokeWidth="7"
          strokeLinecap="round"
        />
        {/* fill */}
        <path
          d={ARC_PATH}
          fill="none"
          stroke={strokeColor}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${ARC_TOTAL} ${ARC_TOTAL}`}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
        />
        {/* score text */}
        <text
          x="55"
          y="70"
          textAnchor="middle"
          fontSize="22"
          fontWeight="bold"
          fill="#1b1818"
          style={{ fontFamily: "inherit" }}
        >
          {score}
        </text>
      </svg>
    </div>
  );
}

// ── meter bar ──────────────────────────────────────────────────────────────────

function MeterBar({ value, max }: { value: number; max: number }) {
  const pct = Math.min(100, (value / max) * 100);
  const color = pct >= 66 ? "#528547" : pct >= 33 ? "#2e6f9e" : "#d87941";

  return (
    <div className="h-1.5 w-full rounded-full bg-alabaster-grey-200 overflow-hidden">
      <div
        className="h-full rounded-full"
        style={{
          width: `${pct}%`,
          backgroundColor: color,
          transition: "width 1s ease-out",
        }}
      />
    </div>
  );
}

// ── pie chart (SVG) ────────────────────────────────────────────────────────────

function PieChart({ slices }: { slices: { name: string; pct: number }[] }) {
  let cum = 0;
  const total = slices.reduce((a, s) => a + s.pct, 0);
  const r = 38;
  const cx = 50;
  const cy = 50;

  const paths = slices.map((s, i) => {
    const start = (cum / total) * 2 * Math.PI - Math.PI / 2;
    cum += s.pct;
    const end = (cum / total) * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    const large = end - start > Math.PI ? 1 : 0;
    return (
      <path
        key={s.name}
        d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`}
        fill={PALETTE[i % PALETTE.length]}
        stroke="white"
        strokeWidth="1.5"
      />
    );
  });

  return (
    <div className="flex flex-col items-start gap-3">
      <svg viewBox="0 0 100 100" className="w-28 h-28 flex-shrink-0">
        {paths}
      </svg>
      <div className="space-y-1">
        {slices.map((s, i) => (
          <div key={s.name} className="flex items-center gap-1.5 text-xs text-alabaster-grey-600">
            <span
              className="h-2.5 w-2.5 rounded-full flex-shrink-0"
              style={{ background: PALETTE[i % PALETTE.length] }}
            />
            {s.name} · {s.pct}%
          </div>
        ))}
      </div>
    </div>
  );
}

// ── sentiment score cell ───────────────────────────────────────────────────────

function SentimentScoreCell({ score, description, bullets, label }: {
  score: number; description: string; bullets: string[]; label?: string;
}) {
  const color = score >= 66 ? "text-mint-cream-600" : score >= 33 ? "text-steel-blue-600" : "text-sandy-brown-600";
  return (
    <div className="space-y-2">
      <div className={cn("text-2xl font-bold", color)}>{score}<span className="text-sm text-alabaster-grey-400 font-normal">/100</span></div>
      {label && <p className="text-xs font-semibold text-alabaster-grey-700">{label}</p>}
      <p className="text-xs text-alabaster-grey-500 leading-relaxed">{description}</p>
      <ul className="space-y-1 mt-1">
        {bullets.map(b => (
          <li key={b} className="flex items-start gap-1.5 text-xs text-alabaster-grey-500">
            <span className="mt-1 h-1 w-1 rounded-full bg-alabaster-grey-300 flex-shrink-0" />
            {b}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── comparison grid ────────────────────────────────────────────────────────────

interface GridRow {
  label: string;
  cells: ReactNode[];
  isLast?: boolean;
}

function ComparisonGrid({
  rows,
  modelCount,
}: {
  rows: GridRow[];
  modelCount: number;
}) {
  return (
    <div className="overflow-x-auto">
      <div
        className="grid border border-alabaster-grey-200 rounded-xl overflow-hidden min-w-[560px]"
        style={{
          gridTemplateColumns: `180px repeat(${modelCount}, minmax(0, 1fr))`,
        }}
      >
        {rows.flatMap((row, ri) => [
          <div
            key={`label-${ri}`}
            className={cn(
              "p-4 border-r border-alabaster-grey-200 flex items-start pt-5 bg-alabaster-grey-50",
              !row.isLast && "border-b border-alabaster-grey-200"
            )}
          >
            <span className="text-xs font-medium text-alabaster-grey-500 uppercase tracking-wide leading-snug">
              {row.label}
            </span>
          </div>,
          ...row.cells.map((cell, ci) => (
            <div
              key={`cell-${ri}-${ci}`}
              className={cn(
                "p-4 border-r border-alabaster-grey-200 last:border-r-0",
                !row.isLast && "border-b border-alabaster-grey-200"
              )}
            >
              {cell}
            </div>
          )),
        ])}
      </div>
    </div>
  );
}

// ── section wrapper ────────────────────────────────────────────────────────────

function ReportSection({
  title,
  description,
  alt,
  children,
}: {
  title: string;
  description: string;
  alt?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "border-b border-alabaster-grey-200",
        alt ? "bg-soft-linen-50" : "bg-white"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-alabaster-grey-900">{title}</h2>
          <p className="text-sm text-alabaster-grey-500 mt-1">{description}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── email gate ─────────────────────────────────────────────────────────────────

function EmailGate({ id, onUnlock }: { id: string; onUnlock: () => void }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUnlock = async () => {
    if (!email.match(/^[^@]+@[^@]+\.[^@]+$/)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, analysisId: id }),
      });
      if (!res.ok) throw new Error();
      toast.success("Your full report has been unlocked!");
      onUnlock();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="rounded-2xl border border-alabaster-grey-200 bg-white backdrop-blur-md p-8 shadow-xl max-w-sm mx-auto text-center"
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-steel-blue-50 mx-auto">
        <Lock className="h-6 w-6 text-steel-blue-600" />
      </div>
      <h3 className="text-2xl font-bold text-alabaster-grey-900 mb-2">
        Unlock Full Report
      </h3>
      <p className="text-alabaster-grey-600 text-sm mb-6 leading-relaxed">
        Enter your work email to access detailed insights, model scores, and
        prioritized recommendations completely free.
      </p>
      <div className="space-y-3">
        <input
          type="email"
          className="w-full"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
        />
        <button
          onClick={handleUnlock}
          disabled={loading || !email}
          className="btn-primary w-full py-3.5"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Unlocking...
            </>
          ) : (
            <>
              Unlock Full Report
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
      <p className="mt-4 text-xs text-alabaster-grey-400">
        No credit card required. We&apos;ll send a copy to your email.
      </p>
    </motion.div>
  );
}

// ── page ───────────────────────────────────────────────────────────────────────

export default function ReportPage() {
  const params = useParams();
  const id = params.id as string;

  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch(`/api/report/${id}`);
        if (!res.ok) throw new Error("Report not found");
        const data = await res.json();
        setReport(data);
        setUnlocked(data.unlocked);
      } catch {
        toast.error("Could not load report.");
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 rounded-full border-2 border-steel-blue-400 border-t-transparent animate-spin mb-4" />
          <p className="text-alabaster-grey-500">Loading your report...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-sandy-brown-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-alabaster-grey-900 mb-2">
            Report Not Found
          </h2>
          <p className="text-alabaster-grey-500">
            This report may have expired or does not exist.
          </p>
        </div>
      </div>
    );
  }

  const { modelScores: models, insights, recommendations } = report;

  // ── row data ───────────────────────────────────────────────────────────────

  const scoreBreakdownRows: GridRow[] = [
    {
      label: "LLM Provider",
      cells: models.map((m) => {
        const Logo = AI_MODEL_LOGOS[m.modelId as keyof typeof AI_MODEL_LOGOS];
        return (
          <div key={m.modelId} className="flex flex-col items-center gap-2 py-1">
            {Logo && <Logo className="h-8 w-8 text-alabaster-grey-600" />}
            <span className="text-xs text-alabaster-grey-500 text-center leading-tight">
              {MODEL_DESCS[m.modelId] ?? m.model}
            </span>
          </div>
        );
      }),
    },
    {
      label: "AEO Score (Overall)",
      cells: models.map((m) => (
        <div key={m.modelId} className="flex flex-col items-center gap-1 py-2">
          <ScoreArc score={m.score} />
          <p className="text-xs text-alabaster-grey-500 text-center leading-snug">
            {getScoreTagline(m.score)}
          </p>
        </div>
      )),
    },
    {
      label: "Brand Recognition",
      cells: models.map((m) => {
        const s = getSubScores(m.score);
        return (
          <div key={m.modelId} className="space-y-2">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-alabaster-grey-900">
                {s.brandRecognition}
              </span>
              <span className="text-alabaster-grey-400 text-sm">/20</span>
            </div>
            <MeterBar value={s.brandRecognition} max={20} />
          </div>
        );
      }),
    },
    {
      label: "Market Score",
      cells: models.map((m) => {
        const s = getSubScores(m.score);
        return (
          <div key={m.modelId} className="space-y-2">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-alabaster-grey-900">
                {s.marketScore}
              </span>
              <span className="text-alabaster-grey-400 text-sm">/10</span>
            </div>
            <MeterBar value={s.marketScore} max={10} />
          </div>
        );
      }),
    },
    {
      label: "Presence Quality",
      cells: models.map((m) => {
        const s = getSubScores(m.score);
        return (
          <div key={m.modelId} className="space-y-2">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-alabaster-grey-900">
                {s.presenceQuality}
              </span>
              <span className="text-alabaster-grey-400 text-sm">/20</span>
            </div>
            <MeterBar value={s.presenceQuality} max={20} />
          </div>
        );
      }),
    },
    {
      label: "Brand Sentiment",
      cells: models.map((m) => {
        const s = getSubScores(m.score);
        return (
          <div key={m.modelId} className="space-y-2">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-alabaster-grey-900">
                {s.brandSentiment}
              </span>
              <span className="text-alabaster-grey-400 text-sm">/40</span>
            </div>
            <MeterBar value={s.brandSentiment} max={40} />
          </div>
        );
      }),
    },
    {
      label: "Share of Voice",
      cells: models.map((m) => {
        const s = getSubScores(m.score);
        return (
          <div key={m.modelId} className="space-y-2">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-alabaster-grey-900">
                {s.shareOfVoice}
              </span>
              <span className="text-alabaster-grey-400 text-sm">/10</span>
            </div>
            <MeterBar value={s.shareOfVoice} max={10} />
          </div>
        );
      }),
    },
    {
      label: "Summary",
      isLast: true,
      cells: models.map((m) => (
        <p key={m.modelId} className="text-xs text-alabaster-grey-500 leading-relaxed">
          {m.sampleResponse}
        </p>
      )),
    },
  ];

  const brandRecognitionRows: GridRow[] = [
    {
      label: "Recognition Score",
      cells: models.map((m) => (
        <div key={m.modelId} className="space-y-2">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-alabaster-grey-900">{m.score}</span>
            <span className="text-alabaster-grey-400 text-sm">/100</span>
          </div>
          <MeterBar value={m.score} max={100} />
        </div>
      )),
    },
    {
      label: "Market Position",
      cells: models.map((m) => {
        const pos = m.brandRecognitionData?.marketPosition ?? getMarketPosition(m.score);
        return (
          <span
            key={m.modelId}
            className={cn(
              "text-sm font-semibold",
              pos === "Leader" ? "text-mint-cream-600" :
              pos === "Challenger" ? "text-steel-blue-600" :
              "text-alabaster-grey-500"
            )}
          >
            {pos}
          </span>
        );
      }),
    },
    {
      label: "Brand Archetype",
      cells: models.map((m) => (
        <span key={m.modelId} className="text-sm font-medium text-alabaster-grey-700">
          {m.brandRecognitionData?.brandArchetype ?? getBrandArchetype(m.sentiment)}
        </span>
      )),
    },
    {
      label: "Confidence Level",
      cells: models.map((m) => (
        <div key={m.modelId} className="space-y-2">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-alabaster-grey-900">
              {m.brandRecognitionData?.confidenceLevel ?? m.score}
            </span>
            <span className="text-alabaster-grey-400 text-sm">%</span>
          </div>
          <MeterBar value={m.brandRecognitionData?.confidenceLevel ?? m.score} max={100} />
        </div>
      )),
    },
    {
      label: "Mention Depth",
      cells: models.map((m) => (
        <div key={m.modelId} className="space-y-2">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-alabaster-grey-900">
              {m.brandRecognitionData?.mentionDepth ?? Math.round(m.score / 10)}
            </span>
            <span className="text-alabaster-grey-400 text-sm">/10</span>
          </div>
          <MeterBar value={m.brandRecognitionData?.mentionDepth ?? Math.round(m.score / 10)} max={10} />
        </div>
      )),
    },
    {
      label: "Source Quality",
      cells: models.map((m) => (
        <div key={m.modelId} className="space-y-2">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-alabaster-grey-900">
              {m.brandRecognitionData?.sourceQuality ?? Math.round(m.score / 10)}
            </span>
            <span className="text-alabaster-grey-400 text-sm">/10</span>
          </div>
          <MeterBar value={m.brandRecognitionData?.sourceQuality ?? Math.round(m.score / 10)} max={10} />
        </div>
      )),
    },
    {
      label: "Data Richness",
      cells: models.map((m) => (
        <div key={m.modelId} className="space-y-2">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-alabaster-grey-900">
              {m.brandRecognitionData?.dataRichness ?? Math.round(m.score / 10)}
            </span>
            <span className="text-alabaster-grey-400 text-sm">/10</span>
          </div>
          <MeterBar value={m.brandRecognitionData?.dataRichness ?? Math.round(m.score / 10)} max={10} />
        </div>
      )),
    },
    {
      label: "Key Topics",
      isLast: true,
      cells: models.map((m) => (
        <ul key={m.modelId} className="space-y-1">
          {m.topKeywords.map((kw) => (
            <li key={kw} className="flex items-center gap-1.5 text-xs text-alabaster-grey-600">
              <span className="h-1 w-1 rounded-full bg-alabaster-grey-400 flex-shrink-0" />
              {kw}
            </li>
          ))}
        </ul>
      )),
    },
  ];

  const analysisSummaryRows: GridRow[] = [
    {
      label: "Key Strengths",
      cells: models.map((m) => {
        if (m.keyStrengths && m.keyStrengths.length > 0) {
          return (
            <ul key={m.modelId} className="space-y-1">
              {m.keyStrengths.map((s) => (
                <li key={s} className="flex items-start gap-1.5 text-xs text-alabaster-grey-600">
                  <span className="mt-1 h-1 w-1 rounded-full bg-mint-cream-400 flex-shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          );
        }
        const s =
          insights.find((i: Insight) => i.type === "strength" && i.models.includes(m.model)) ??
          insights.find((i: Insight) => i.type === "strength");
        return s ? (
          <div key={m.modelId}>
            <p className="text-xs font-semibold text-alabaster-grey-800 mb-1">{s.title}</p>
            <p className="text-xs text-alabaster-grey-500 leading-relaxed">{s.description}</p>
          </div>
        ) : (
          <span key={m.modelId} className="text-xs text-alabaster-grey-400">No data</span>
        );
      }),
    },
    {
      label: "Growth Areas",
      cells: models.map((m) => {
        if (m.growthAreas && m.growthAreas.length > 0) {
          return (
            <ul key={m.modelId} className="space-y-1">
              {m.growthAreas.map((g) => (
                <li key={g} className="flex items-start gap-1.5 text-xs text-alabaster-grey-600">
                  <span className="mt-1 h-1 w-1 rounded-full bg-steel-blue-400 flex-shrink-0" />
                  {g}
                </li>
              ))}
            </ul>
          );
        }
        const o =
          insights.find((i: Insight) => i.type === "opportunity" && i.models.includes(m.model)) ??
          insights.find((i: Insight) => i.type === "opportunity");
        return o ? (
          <div key={m.modelId}>
            <p className="text-xs font-semibold text-alabaster-grey-800 mb-1">{o.title}</p>
            <p className="text-xs text-alabaster-grey-500 leading-relaxed">{o.description}</p>
          </div>
        ) : (
          <span key={m.modelId} className="text-xs text-alabaster-grey-400">No data</span>
        );
      }),
    },
    {
      label: "Market Trajectory",
      isLast: true,
      cells: models.map((m) => {
        const traj = m.marketTrajectory;
        const icon = traj === "Rising" ? <TrendingUp className="h-4 w-4 text-mint-cream-500 inline mr-1" /> :
                     traj === "Declining" ? <TrendingDown className="h-4 w-4 text-sandy-brown-500 inline mr-1" /> :
                     <Minus className="h-4 w-4 text-steel-blue-400 inline mr-1" />;
        const label = traj ?? (m.sentiment === "positive" ? "Rising" : m.sentiment === "neutral" ? "Stable" : "Declining");
        return (
          <div key={m.modelId}>
            <p className="text-sm font-semibold text-alabaster-grey-800 mb-1">{icon}{label}</p>
          </div>
        );
      }),
    },
  ];

  const contextualRows: GridRow[] = [
    {
      label: "Narrative Themes",
      isLast: true,
      cells: models.map((m) => {
        const themes = (m.narrativeThemes && m.narrativeThemes.length > 0) ? m.narrativeThemes : m.topKeywords;
        return (
          <ul key={m.modelId} className="space-y-1.5">
            {themes.map((kw) => (
              <li key={kw} className="flex items-start gap-1.5 text-xs text-alabaster-grey-600">
                <span className="mt-1.5 h-1 w-1 rounded-full bg-alabaster-grey-400 flex-shrink-0" />
                {kw}
              </li>
            ))}
          </ul>
        );
      }),
    },
  ]; // end contextualRows

  // ── Market Competition rows (real LLM data with fallbacks) ─────────────────
  const marketCompetitionRows: GridRow[] = [
    {
      label: "Market Score",
      cells: models.map((m) => {
        const score = m.marketScore ?? Math.round((m.score / 100) * 10);
        return (
          <div key={m.modelId} className="space-y-2">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-alabaster-grey-900">{score}</span>
              <span className="text-alabaster-grey-400 text-sm">/10</span>
            </div>
            <MeterBar value={score} max={10} />
          </div>
        );
      }),
    },
    {
      label: "Share of Voice",
      cells: models.map((m) => {
        const slices = m.shareOfVoice ?? getMockShareOfVoice(report.companyName);
        return (
          <div key={m.modelId}>
            <PieChart slices={slices} />
          </div>
        );
      }),
    },
    {
      label: "Mentions",
      cells: models.map((m) => (
        <span key={m.modelId} className="text-xl font-bold text-alabaster-grey-900">
          {m.mentions.toLocaleString()}
        </span>
      )),
    },
    {
      label: "Comparison Mentions",
      cells: models.map((m) => (
        <span key={m.modelId} className="text-xl font-bold text-alabaster-grey-900">
          {(m.comparisonMentions ?? Math.round(m.mentions * 0.6)).toLocaleString()}
        </span>
      )),
    },
    {
      label: "Common Comparisons",
      isLast: true,
      cells: models.map((m) => {
        const topics = m.comparisonTopics && m.comparisonTopics.length > 0
          ? m.comparisonTopics
          : getMarketCompetitionData(m.score).comparisonTopics;
        return (
          <ul key={m.modelId} className="space-y-1">
            {topics.map((t) => (
              <li key={t} className="flex items-start gap-1.5 text-xs text-alabaster-grey-600">
                <span className="mt-1.5 h-1 w-1 rounded-full bg-alabaster-grey-400 flex-shrink-0" />
                {t}
              </li>
            ))}
          </ul>
        );
      }),
    },
  ];

  // ── Sentiment rows (real LLM data with fallbacks) ──────────────────────────
  const sentimentRows: GridRow[] = [
    {
      label: "Sentiment Score",
      cells: models.map((m) => {
        const sd = m.sentimentBreakdown ?? getSentimentData(m.score);
        const totalScore = m.sentimentBreakdown
          ? Math.round((m.sentimentBreakdown.general.score + m.sentimentBreakdown.contextual.score + m.sentimentBreakdown.sourceBased.score) / 3)
          : getSentimentData(m.score).totalScore;
        return (
          <div key={m.modelId} className="space-y-2">
            <SentimentScoreCell
              score={totalScore}
              description="Overall brand sentiment across all evaluated dimensions."
              bullets={[]}
            />
            <MeterBar value={totalScore} max={100} />
          </div>
        );
      }),
    },
    {
      label: "General",
      cells: models.map((m) => {
        const g = m.sentimentBreakdown?.general ?? getSentimentData(m.score).general;
        return (
          <div key={m.modelId}>
            <SentimentScoreCell score={g.score} description={g.description} bullets={g.keyFactors} />
          </div>
        );
      }),
    },
    {
      label: "Contextual",
      cells: models.map((m) => {
        const c = m.sentimentBreakdown?.contextual ?? getSentimentData(m.score).contextual;
        return (
          <div key={m.modelId}>
            <SentimentScoreCell score={c.score} description={c.description} bullets={c.keyFactors} />
          </div>
        );
      }),
    },
    {
      label: "Source-Based",
      cells: models.map((m) => {
        const s = m.sentimentBreakdown?.sourceBased ?? getSentimentData(m.score).sourceBased;
        return (
          <div key={m.modelId}>
            <SentimentScoreCell score={s.score} description={s.description} bullets={[]} />
          </div>
        );
      }),
    },
    {
      label: "Polarization",
      cells: models.map((m) => {
        const p = m.sentimentBreakdown?.polarization ?? getSentimentData(m.score).polarization;
        return (
          <div key={m.modelId}>
            <SentimentScoreCell score={p.score} description={p.description} bullets={p.insights} />
          </div>
        );
      }),
    },
    {
      label: "Source Analysis",
      isLast: true,
      cells: models.map((m) => {
        const sources = m.sentimentBreakdown?.sources ?? getSentimentData(m.score).sources;
        return (
          <div key={m.modelId} className="space-y-2">
            <p className="text-xs font-semibold text-mint-cream-600">✓ Reliable Data Sources</p>
            {sources.map((src) => (
              <div key={src.name} className="p-2.5 rounded-lg bg-alabaster-grey-50 border border-alabaster-grey-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-alabaster-grey-800">{src.name}</span>
                  <span className="text-xs font-bold text-steel-blue-600">{src.score}/100</span>
                </div>
                <p className="text-xs text-alabaster-grey-400 leading-relaxed">{src.note}</p>
              </div>
            ))}
          </div>
        );
      }),
    },
  ];

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* ── Hero ── */}
      <div className="bg-alabaster-grey-50 border-b border-alabaster-grey-200">
        <motion.div
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <h1 className="font-serif text-5xl md:text-6xl text-alabaster-grey-900 mb-4">
            {report.companyName}
          </h1>
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-alabaster-grey-500">
            <span>across</span>
            <span className="font-semibold text-alabaster-grey-800">
              {models.length} AI models
            </span>
            <span>in</span>
            <span className="font-semibold text-alabaster-grey-800">
              {report.geography}
            </span>
            <span>for</span>
            <span className="font-semibold text-alabaster-grey-800">
              {report.products}
            </span>
            <span>in the</span>
            <span className="font-semibold text-alabaster-grey-800">
              {report.industry}
            </span>
            <span>industry.</span>
            <a
              href="/"
              className="inline-flex items-center gap-1 ml-2 text-alabaster-grey-400 hover:text-steel-blue-600 transition-colors text-xs"
            >
              <ExternalLink className="h-3 w-3" />
              Update
            </a>
          </div>
        </motion.div>
      </div>

      {/* ── Score Breakdown Grid ── */}
      <div className="bg-alabaster-grey-50 border-b border-alabaster-grey-200">
        <motion.div
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <ComparisonGrid modelCount={models.length} rows={scoreBreakdownRows} />
        </motion.div>
      </div>

      {/* ── Gated Sections (from Details onwards) ── */}
      <div className="relative">
        <div className={cn(!unlocked && "pointer-events-none select-none")}>
          <div
            className={cn(
              "transition-all duration-500",
              !unlocked && "blur-sm opacity-40"
            )}
          >
            {/* Details Header */}
            <div className="bg-white border-b border-alabaster-grey-200">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="font-serif text-3xl text-alabaster-grey-900">Details</h1>
              </div>
            </div>

            {/* Brand Recognition */}
            <ReportSection
              title="Brand Recognition"
              description="Shows how visible your brand is across digital channels. Higher scores mean more people recognize your brand name."
              alt
            >
              <ComparisonGrid
                modelCount={models.length}
                rows={brandRecognitionRows}
              />
            </ReportSection>

            {/* Analysis Summary */}
            <ReportSection
              title="Analysis Summary"
              description="Identifies strengths and growth opportunities based on sentiment analysis, customer feedback, and industry benchmarks."
            >
              <ComparisonGrid
                modelCount={models.length}
                rows={analysisSummaryRows}
              />
            </ReportSection>

            {/* Contextual Analysis */}
            <ReportSection
              title="Contextual Analysis"
              description="Assesses how your brand is perceived within the industry by analyzing recurring narratives, perceptions, and topic associations."
              alt
            >
              <ComparisonGrid
                modelCount={models.length}
                rows={contextualRows}
              />
            </ReportSection>

            {/* Market Competition */}
            <ReportSection
              title="Market Competition"
              description="Measures your brand's presence in industry conversations compared to competitors — your share of voice."
            >
              <ComparisonGrid
                modelCount={models.length}
                rows={marketCompetitionRows}
              />
            </ReportSection>

            {/* Sentiment Analysis */}
            <ReportSection
              title="Sentiment Analysis"
              description="Evaluates the language in AI responses to determine the holistic sentiment and market perception of your brand."
              alt
            >
              <ComparisonGrid
                modelCount={models.length}
                rows={sentimentRows}
              />
            </ReportSection>

            {/* Recommendations */}
            <div className="bg-white border-b border-alabaster-grey-200">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-alabaster-grey-900">
                    Recommendations
                  </h2>
                  <p className="text-sm text-alabaster-grey-500 mt-1">
                    Prioritized action items to improve your AI visibility and
                    brand presence across all major platforms.
                  </p>
                </div>
                <div className="space-y-4">
                  {recommendations.map((rec: Recommendation, i: number) => (
                    <div
                      key={i}
                      className="flex items-start gap-5 p-5 rounded-xl border border-alabaster-grey-200 bg-alabaster-grey-50"
                    >
                      <div
                        className={cn(
                          "flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold",
                          rec.priority === "high"
                            ? "bg-steel-blue-50 text-steel-blue-700"
                            : rec.priority === "medium"
                            ? "bg-sandy-brown-50 text-sandy-brown-700"
                            : "bg-alabaster-grey-100 text-alabaster-grey-500"
                        )}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <p className="text-sm font-semibold text-alabaster-grey-900">
                            {rec.title}
                          </p>
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                              rec.priority === "high"
                                ? "bg-steel-blue-50 text-steel-blue-600"
                                : rec.priority === "medium"
                                ? "bg-sandy-brown-50 text-sandy-brown-600"
                                : "bg-alabaster-grey-100 text-alabaster-grey-500"
                            )}
                          >
                            {rec.priority} priority
                          </span>
                        </div>
                        <p className="text-xs text-alabaster-grey-500 leading-relaxed">
                          {rec.description}
                        </p>
                        <p className="text-xs text-alabaster-grey-400 mt-2">
                          Estimated effort: {rec.effort}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Email gate overlay */}
        {!unlocked && (
          <div className="absolute inset-0 flex items-start justify-center pt-24 px-4">
            <div className="sticky top-24">
              <EmailGate id={id} onUnlock={() => setUnlocked(true)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
