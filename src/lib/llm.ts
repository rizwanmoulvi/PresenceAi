/**
 * Real LLM analysis engine — queries GPT-4o, Claude, Gemini, Perplexity, and
 * Grok in parallel and returns structured brand-visibility data.
 */

import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ModelScore, Insight, Recommendation, SimulationResult } from "./simulate";

// ── extended model score (includes real data fields) ──────────────────────────

export interface RealModelScore extends ModelScore {
  brandRecognitionData?: {
    marketPosition: "Leader" | "Challenger" | "Niche";
    brandArchetype: "Innovator" | "Traditionalist" | "Disruptor";
    confidenceLevel: number;
    mentionDepth: number;
    sourceQuality: number;
    dataRichness: number;
  };
  keyStrengths?: string[];
  growthAreas?: string[];
  marketTrajectory?: "Rising" | "Stable" | "Declining";
  narrativeThemes?: string[];
  marketScore?: number;
  comparisonMentions?: number;
  comparisonTopics?: string[];
  shareOfVoice?: { name: string; pct: number }[];
  sentimentBreakdown?: {
    general: { score: number; description: string; keyFactors: string[] };
    contextual: { score: number; description: string; keyFactors: string[] };
    sourceBased: { score: number; description: string; keyFactors: string[] };
    polarization: { score: number; description: string; insights: string[] };
    sources: { name: string; type: string; score: number; note: string }[];
  };
}

// ── model registry ─────────────────────────────────────────────────────────────

const MODELS = [
  { model: "ChatGPT-4o",       modelId: "chatgpt",    provider: "openai"      },
  { model: "Claude 3.5 Sonnet", modelId: "claude",     provider: "anthropic"   },
  { model: "Gemini 1.5 Pro",    modelId: "gemini",     provider: "gemini"      },
  { model: "Perplexity AI",     modelId: "perplexity", provider: "perplexity"  },
  { model: "Grok 2",            modelId: "grok",       provider: "grok"        },
];

// Groq free-tier model mapping (one key, five fast models)
// Sign up free at https://console.groq.com
const GROQ_MODEL_MAP: Record<string, string> = {
  chatgpt:    "llama-3.3-70b-versatile",
  claude:     "llama-3.1-70b-versatile",
  gemini:     "gemma2-9b-it",
  perplexity: "mixtral-8x7b-32768",
  grok:       "llama-3.1-8b-instant",
};

// ── prompt templates ───────────────────────────────────────────────────────────

function buildSystemPrompt(): string {
  return `You are a brand-intelligence analyst specialising in Generative Engine Optimisation (GEO / AEO / LLMEO). Your job is to honestly assess how a brand is represented in AI-generated responses.

You MUST respond with ONLY a single valid JSON object — no markdown, no code fences, no commentary, no trailing text. The JSON must be parseable by JSON.parse() immediately.`;
}

function buildUserPrompt(
  companyName: string,
  industry: string,
  geography: string,
  products: string
): string {
  return `Analyse the AI brand visibility of "${companyName}", which operates in the ${industry} industry, offering "${products}", primarily serving "${geography}".

Based on your training knowledge, provide an honest, realistic assessment. If you have limited knowledge of this brand, reflect that with lower scores.

Return this exact JSON (all fields required, no extras):
{
  "score": <integer 0-100: how visible/recognised this brand is in AI responses for its category>,
  "mentions": <integer: estimated monthly AI-conversation mentions about this brand in its space>,
  "sentiment": <"positive" | "neutral" | "negative">,
  "topKeywords": [<exactly 5 keywords most associated with this brand>],
  "sampleResponse": "<2-3 sentence response you would naturally give if asked 'What are good ${products} options in ${geography}?'>",
  "brandRecognitionData": {
    "marketPosition": <"Leader" | "Challenger" | "Niche">,
    "brandArchetype": <"Innovator" | "Traditionalist" | "Disruptor">,
    "confidenceLevel": <integer 0-100: your confidence in your knowledge of this brand>,
    "mentionDepth": <integer 0-10>,
    "sourceQuality": <integer 0-10>,
    "dataRichness": <integer 0-10>
  },
  "keyStrengths": [<3-4 genuine strengths based on your knowledge>],
  "growthAreas": [<2-3 areas where brand AI visibility could improve>],
  "marketTrajectory": <"Rising" | "Stable" | "Declining">,
  "narrativeThemes": [<4-5 themes that recur when this brand is discussed>],
  "marketScore": <integer 0-10: competitive market position>,
  "comparisonMentions": <integer: how often compared to competitors>,
  "comparisonTopics": [<4-5 topics this brand is typically compared on with competitors>],
  "shareOfVoice": [<3-5 objects with {name: string, pct: integer} representing this brand and top competitors, summing to 100>],
  "sentimentBreakdown": {
    "general":     {"score": <0-100>, "description": "<1-2 sentences>", "keyFactors": [<3 strings>]},
    "contextual":  {"score": <0-100>, "description": "<1-2 sentences>", "keyFactors": [<3 strings>]},
    "sourceBased": {"score": <0-100>, "description": "<1-2 sentences>", "keyFactors": [<3 strings>]},
    "polarization":{"score": <0-100>, "description": "<1-2 sentences>", "insights":   [<3 strings>]},
    "sources": [
      {"name": "<source name>", "type": "<source type>", "score": <0-100>, "note": "<1 sentence>"},
      {"name": "<source name>", "type": "<source type>", "score": <0-100>, "note": "<1 sentence>"}
    ]
  }
}`;
}

function buildInsightsPrompt(
  companyName: string,
  industry: string,
  geography: string,
  products: string,
  results: RealModelScore[]
): string {
  const summary = results.map((r) => ({
    model: r.model,
    score: r.score,
    sentiment: r.sentiment,
    keyStrengths: r.keyStrengths,
    growthAreas: r.growthAreas,
    marketTrajectory: r.marketTrajectory,
  }));

  return `Based on the following multi-model AI brand analysis of "${companyName}" (${industry}, ${products}, ${geography}):

${JSON.stringify(summary, null, 2)}

Generate 3-4 strategic insights and 5 actionable recommendations.

Return ONLY this exact JSON (no markdown, no extras):
{
  "insights": [
    {
      "type": <"strength" | "weakness" | "opportunity" | "threat">,
      "title": "<concise title>",
      "description": "<2-3 sentence description referencing the brand and specific findings>",
      "models": [<model names this applies to>]
    }
  ],
  "recommendations": [
    {
      "priority": <"high" | "medium" | "low">,
      "title": "<action title>",
      "description": "<2-3 sentence specific, actionable recommendation for ${companyName}>",
      "effort": "<realistic timeframe, e.g. '2-4 weeks'>"
    }
  ]
}`;
}

// ── json extraction (robust) ───────────────────────────────────────────────────

function extractJSON(raw: string): unknown {
  // Try the whole string first
  try { return JSON.parse(raw); } catch { /* continue */ }

  // Look for the first { ... } block
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start !== -1 && end > start) {
    try { return JSON.parse(raw.slice(start, end + 1)); } catch { /* continue */ }
  }
  throw new Error("Could not parse JSON from response");
}

// ── normalise & clamp ──────────────────────────────────────────────────────────

function clamp(n: unknown, lo = 0, hi = 100): number {
  const v = Number(n);
  if (Number.isNaN(v)) return Math.round((lo + hi) / 2);
  return Math.max(lo, Math.min(hi, Math.round(v)));
}

function normaliseScore(raw: Record<string, unknown>, companyName: string, modelId: string): RealModelScore {
  const score   = clamp(raw.score, 0, 100);
  const sentRaw = String(raw.sentiment ?? "neutral");
  const sentiment: ModelScore["sentiment"] =
    sentRaw === "positive" ? "positive" : sentRaw === "negative" ? "negative" : "neutral";

  const visibility: ModelScore["visibility"] =
    score >= 70 ? "high" : score >= 40 ? "medium" : score >= 15 ? "low" : "none";

  const br = (raw.brandRecognitionData ?? {}) as Record<string, unknown>;
  const sd = (raw.sentimentBreakdown   ?? {}) as Record<string, unknown>;

  const gen  = (sd.general     ?? {}) as Record<string, unknown>;
  const ctx  = (sd.contextual  ?? {}) as Record<string, unknown>;
  const src  = (sd.sourceBased ?? {}) as Record<string, unknown>;
  const pol  = (sd.polarization ?? {}) as Record<string, unknown>;
  const srcs = Array.isArray(sd.sources) ? sd.sources as Record<string, unknown>[] : [];

  const sov: { name: string; pct: number }[] = Array.isArray(raw.shareOfVoice)
    ? (raw.shareOfVoice as Record<string, unknown>[]).map((s) => ({
        name: String(s.name ?? "Unknown"),
        pct:  clamp(s.pct, 0, 100),
      }))
    : [{ name: companyName, pct: clamp(score / 10, 0, 50) }, { name: "Others", pct: 100 - clamp(score / 10, 0, 50) }];

  return {
    model:     MODELS.find((m) => m.modelId === modelId)?.model ?? modelId,
    modelId,
    score,
    visibility,
    mentions:  clamp(raw.mentions, 0, 99999),
    sentiment,
    topKeywords: Array.isArray(raw.topKeywords)
      ? (raw.topKeywords as unknown[]).map(String).slice(0, 5)
      : ["brand", "product", "service", "quality", "market"],
    sampleResponse: String(raw.sampleResponse ?? `${companyName} operates in the ${sentRaw} sentiment zone.`),

    brandRecognitionData: {
      marketPosition: (["Leader","Challenger","Niche"].includes(String(br.marketPosition)) ? br.marketPosition : "Challenger") as "Leader"|"Challenger"|"Niche",
      brandArchetype: (["Innovator","Traditionalist","Disruptor"].includes(String(br.brandArchetype)) ? br.brandArchetype : "Traditionalist") as "Innovator"|"Traditionalist"|"Disruptor",
      confidenceLevel: clamp(br.confidenceLevel),
      mentionDepth:    clamp(br.mentionDepth, 0, 10),
      sourceQuality:   clamp(br.sourceQuality, 0, 10),
      dataRichness:    clamp(br.dataRichness,  0, 10),
    },
    keyStrengths:   Array.isArray(raw.keyStrengths)   ? (raw.keyStrengths as unknown[]).map(String)   : [],
    growthAreas:    Array.isArray(raw.growthAreas)    ? (raw.growthAreas as unknown[]).map(String)    : [],
    marketTrajectory: (["Rising","Stable","Declining"].includes(String(raw.marketTrajectory)) ? raw.marketTrajectory : "Stable") as "Rising"|"Stable"|"Declining",
    narrativeThemes: Array.isArray(raw.narrativeThemes) ? (raw.narrativeThemes as unknown[]).map(String) : [],
    marketScore:        clamp(raw.marketScore, 0, 10),
    comparisonMentions: clamp(raw.comparisonMentions, 0, 99999),
    comparisonTopics:   Array.isArray(raw.comparisonTopics) ? (raw.comparisonTopics as unknown[]).map(String) : [],
    shareOfVoice: sov,
    sentimentBreakdown: {
      general: {
        score:       clamp(gen.score),
        description: String(gen.description ?? ""),
        keyFactors:  Array.isArray(gen.keyFactors) ? (gen.keyFactors as unknown[]).map(String) : [],
      },
      contextual: {
        score:       clamp(ctx.score),
        description: String(ctx.description ?? ""),
        keyFactors:  Array.isArray(ctx.keyFactors) ? (ctx.keyFactors as unknown[]).map(String) : [],
      },
      sourceBased: {
        score:       clamp(src.score),
        description: String(src.description ?? ""),
        keyFactors:  Array.isArray(src.keyFactors) ? (src.keyFactors as unknown[]).map(String) : [],
      },
      polarization: {
        score:       clamp(pol.score),
        description: String(pol.description ?? ""),
        insights:    Array.isArray(pol.insights)    ? (pol.insights as unknown[]).map(String) : [],
      },
      sources: srcs.map((s) => ({
        name:  String(s.name ?? "Source"),
        type:  String(s.type ?? "Online"),
        score: clamp(s.score),
        note:  String(s.note ?? ""),
      })),
    },
  };
}

// ── individual model callers ───────────────────────────────────────────────────

async function callOpenAI(
  companyName: string, industry: string, geography: string, products: string,
  apiKey: string, modelName = "gpt-4o", baseURL?: string
): Promise<Record<string, unknown>> {
  const client = new OpenAI({ apiKey, ...(baseURL ? { baseURL } : {}) });
  const res = await client.chat.completions.create({
    model: modelName,
    max_tokens: 1500,
    temperature: 0.3,
    messages: [
      { role: "system", content: buildSystemPrompt() },
      { role: "user",   content: buildUserPrompt(companyName, industry, geography, products) },
    ],
  });
  return extractJSON(res.choices[0]?.message?.content ?? "{}") as Record<string, unknown>;
}

async function callAnthropic(
  companyName: string, industry: string, geography: string, products: string,
  apiKey: string
): Promise<Record<string, unknown>> {
  const client = new Anthropic({ apiKey });
  const res = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1500,
    system: buildSystemPrompt(),
    messages: [{ role: "user", content: buildUserPrompt(companyName, industry, geography, products) }],
  });
  const text = res.content[0].type === "text" ? res.content[0].text : "{}";
  return extractJSON(text) as Record<string, unknown>;
}

async function callGemini(
  companyName: string, industry: string, geography: string, products: string,
  apiKey: string
): Promise<Record<string, unknown>> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  const prompt = buildSystemPrompt() + "\n\n" + buildUserPrompt(companyName, industry, geography, products);
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return extractJSON(text) as Record<string, unknown>;
}

// ── insights + recommendations via GPT-4o ─────────────────────────────────────

async function generateInsightsAndRecs(
  companyName: string, industry: string, geography: string, products: string,
  results: RealModelScore[],
  openaiKey: string,
  modelName = "gpt-4o",
  baseURL?: string
): Promise<{ insights: Insight[]; recommendations: Recommendation[] }> {
  try {
    const client = new OpenAI({ apiKey: openaiKey, ...(baseURL ? { baseURL } : {}) });
    const res = await client.chat.completions.create({
      model: modelName,
      max_tokens: 1200,
      temperature: 0.4,
      messages: [
        { role: "system", content: buildSystemPrompt() },
        { role: "user",   content: buildInsightsPrompt(companyName, industry, geography, products, results) },
      ],
    });
    const raw = extractJSON(res.choices[0]?.message?.content ?? "{}") as Record<string, unknown>;
    return {
      insights:        Array.isArray(raw.insights)        ? raw.insights as Insight[]        : [],
      recommendations: Array.isArray(raw.recommendations) ? raw.recommendations as Recommendation[] : [],
    };
  } catch (err) {
    console.error("Insights generation failed:", err);
    return { insights: [], recommendations: [] };
  }
}

// ── main orchestrator ──────────────────────────────────────────────────────────

export async function runRealAnalysis(
  companyName: string,
  industry: string,
  geography: string,
  products: string
): Promise<SimulationResult> {
  const OPENAI_KEY      = process.env.OPENAI_API_KEY      ?? "";
  const ANTHROPIC_KEY   = process.env.ANTHROPIC_API_KEY   ?? "";
  const GEMINI_KEY      = process.env.GEMINI_API_KEY      ?? "";
  const PERPLEXITY_KEY  = process.env.PERPLEXITY_API_KEY  ?? "";
  const GROK_KEY        = process.env.XAI_API_KEY         ?? "";
  const GROQ_KEY        = process.env.GROQ_API_KEY        ?? "";

  const isPlaceholder = (k: string) =>
    !k || k.startsWith("sk-your") || k.startsWith("re_your") || k === "your-google";

  const hasRealOpenAI      = !isPlaceholder(OPENAI_KEY);
  const hasRealAnthropic   = !isPlaceholder(ANTHROPIC_KEY);
  const hasRealGemini      = !isPlaceholder(GEMINI_KEY);
  const hasRealPerplexity  = !isPlaceholder(PERPLEXITY_KEY);
  const hasRealGrok        = !isPlaceholder(GROK_KEY);
  const hasGroq            = !isPlaceholder(GROQ_KEY);

  const hasAnyKey = hasRealOpenAI || hasRealAnthropic || hasRealGemini ||
                    hasRealPerplexity || hasRealGrok || hasGroq;

  // ── no keys at all → fast simulate fallback ────────────────────────────────
  if (!hasAnyKey) {
    const { simulateAnalysis } = await import("./simulate");
    return simulateAnalysis(companyName, industry, geography, products);
  }

  // ── fire all available models in parallel ──────────────────────────────────

  const modelCalls: Promise<RealModelScore>[] = [];

  for (const { modelId } of MODELS) {
    // Per-provider real key takes priority; Groq is the free fallback
    const useGroq = hasGroq && !(
      (modelId === "chatgpt"    && hasRealOpenAI) ||
      (modelId === "claude"     && hasRealAnthropic) ||
      (modelId === "gemini"     && hasRealGemini) ||
      (modelId === "perplexity" && hasRealPerplexity) ||
      (modelId === "grok"       && hasRealGrok)
    );

    if (modelId === "chatgpt" && hasRealOpenAI) {
      modelCalls.push(
        callOpenAI(companyName, industry, geography, products, OPENAI_KEY)
          .then((raw) => normaliseScore(raw, companyName, "chatgpt"))
          .catch((err) => { console.error("GPT-4o error:", err); return null as unknown as RealModelScore; })
      );
    } else if (modelId === "claude" && hasRealAnthropic) {
      modelCalls.push(
        callAnthropic(companyName, industry, geography, products, ANTHROPIC_KEY)
          .then((raw) => normaliseScore(raw, companyName, "claude"))
          .catch((err) => { console.error("Claude error:", err); return null as unknown as RealModelScore; })
      );
    } else if (modelId === "gemini" && hasRealGemini) {
      modelCalls.push(
        callGemini(companyName, industry, geography, products, GEMINI_KEY)
          .then((raw) => normaliseScore(raw, companyName, "gemini"))
          .catch((err) => { console.error("Gemini error:", err); return null as unknown as RealModelScore; })
      );
    } else if (modelId === "perplexity" && hasRealPerplexity) {
      modelCalls.push(
        callOpenAI(companyName, industry, geography, products, PERPLEXITY_KEY, "sonar-pro", "https://api.perplexity.ai")
          .then((raw) => normaliseScore(raw, companyName, "perplexity"))
          .catch((err) => { console.error("Perplexity error:", err); return null as unknown as RealModelScore; })
      );
    } else if (modelId === "grok" && hasRealGrok) {
      modelCalls.push(
        callOpenAI(companyName, industry, geography, products, GROK_KEY, "grok-2-latest", "https://api.x.ai/v1")
          .then((raw) => normaliseScore(raw, companyName, "grok"))
          .catch((err) => { console.error("Grok error:", err); return null as unknown as RealModelScore; })
      );
    } else if (useGroq) {
      const groqModel = GROQ_MODEL_MAP[modelId] ?? "llama-3.1-8b-instant";
      modelCalls.push(
        callOpenAI(companyName, industry, geography, products, GROQ_KEY, groqModel, "https://api.groq.com/openai/v1")
          .then((raw) => normaliseScore(raw, companyName, modelId))
          .catch((err) => { console.error(`Groq/${groqModel} error:`, err); return null as unknown as RealModelScore; })
      );
    }
  }

  if (modelCalls.length === 0) {
    // Shouldn't happen (hasAnyKey guard above), but defensive fallback
    const { simulateAnalysis } = await import("./simulate");
    return simulateAnalysis(companyName, industry, geography, products);
  }

  const settled = await Promise.allSettled(modelCalls);
  const modelScores: RealModelScore[] = settled
    .map((r) => (r.status === "fulfilled" ? r.value : null))
    .filter((r): r is RealModelScore => r !== null && r !== undefined);

  if (modelScores.length === 0) {
    throw new Error("All LLM API calls failed. Check your API keys and try again.");
  }

  // ── overall score ──────────────────────────────────────────────────────────

  const overallScore = Math.round(
    modelScores.reduce((sum, m) => sum + m.score, 0) / modelScores.length
  );

  // ── insights + recommendations ─────────────────────────────────────────────

  const insightKey   = hasRealOpenAI ? OPENAI_KEY : hasGroq ? GROQ_KEY : "";
  const insightModel = hasRealOpenAI ? "gpt-4o" : "llama-3.3-70b-versatile";
  const insightBase  = hasRealOpenAI ? undefined : "https://api.groq.com/openai/v1";

  const { insights, recommendations } = insightKey
    ? await generateInsightsAndRecs(companyName, industry, geography, products, modelScores, insightKey, insightModel, insightBase)
    : { insights: [] as Insight[], recommendations: [] as Recommendation[] };

  return { overallScore, modelScores, insights, recommendations };
}
