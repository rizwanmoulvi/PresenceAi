export interface ModelScore {
  model: string;
  modelId: string;
  score: number;
  visibility: "high" | "medium" | "low" | "none";
  mentions: number;
  sentiment: "positive" | "neutral" | "negative";
  topKeywords: string[];
  sampleResponse: string;
}

export interface SimulationResult {
  overallScore: number;
  modelScores: ModelScore[];
  insights: Insight[];
  recommendations: Recommendation[];
}

export interface Insight {
  type: "strength" | "weakness" | "opportunity" | "threat";
  title: string;
  description: string;
  models: string[];
}

export interface Recommendation {
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  effort: string;
}

const AI_MODELS = [
  {
    model: "ChatGPT-4o",
    modelId: "chatgpt",
    color: "#10a37f",
  },
  {
    model: "Claude 3.5 Sonnet",
    modelId: "claude",
    color: "#d97706",
  },
  {
    model: "Gemini 1.5 Pro",
    modelId: "gemini",
    color: "#4f46e5",
  },
  {
    model: "Perplexity AI",
    modelId: "perplexity",
    color: "#0891b2",
  },
  {
    model: "Grok 2",
    modelId: "grok",
    color: "#6b7280",
  },
];

const SENTIMENT_PHRASES = {
  positive: [
    "is widely recognized as a leader in",
    "consistently appears as a top choice for",
    "is frequently recommended for",
    "has strong visibility as a trusted provider of",
    "is often cited as an industry-leading solution for",
  ],
  neutral: [
    "is mentioned in discussions about",
    "appears in some results related to",
    "has moderate presence in conversations about",
    "is occasionally referenced in the context of",
  ],
  negative: [
    "has limited visibility in AI-generated results for",
    "rarely appears in responses about",
    "has minimal presence in AI model outputs related to",
  ],
};

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function seededRandom(seed: string, index: number): number {
  let hash = 0;
  const str = seed + index;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash % 100) / 100;
}

function getVisibility(score: number): ModelScore["visibility"] {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  if (score >= 15) return "low";
  return "none";
}

function getSentiment(score: number): ModelScore["sentiment"] {
  if (score >= 60) return "positive";
  if (score >= 30) return "neutral";
  return "negative";
}

function generateKeywords(
  industry: string,
  products: string,
  geography: string
): string[] {
  const industryWords = industry.split(" ").slice(0, 2);
  const productWords = products.split(" ").slice(0, 2);
  const geoWord = geography.split(",")[0].trim();

  const allWords = [...industryWords, ...productWords, geoWord];
  return allWords.filter((w) => w.length > 2).slice(0, 5);
}

function generateSampleResponse(
  companyName: string,
  products: string,
  industry: string,
  geography: string,
  sentiment: ModelScore["sentiment"]
): string {
  const phrases = SENTIMENT_PHRASES[sentiment];
  const phrase = phrases[randomBetween(0, phrases.length - 1)];

  if (sentiment === "positive") {
    return `${companyName} ${phrase} ${products.split(",")[0].trim()} in the ${industry} space, particularly in ${geography}. Organizations seeking solutions in this area often turn to ${companyName} for its comprehensive approach and market expertise.`;
  } else if (sentiment === "neutral") {
    return `${companyName} ${phrase} ${industry}. While not always the first recommendation, the company maintains a presence in ${geography} and offers ${products.split(",")[0].trim()} to clients in this sector.`;
  } else {
    return `${companyName} ${phrase} ${industry} in ${geography}. Companies looking for ${products.split(",")[0].trim()} may not immediately encounter ${companyName} in AI-generated recommendations without targeted optimization efforts.`;
  }
}

export function simulateAnalysis(
  companyName: string,
  industry: string,
  geography: string,
  products: string
): SimulationResult {
  const seed = `${companyName}-${industry}`;

  const modelScores: ModelScore[] = AI_MODELS.map((model, i) => {
    const baseScore = Math.floor(seededRandom(seed, i * 7) * 85) + 10;
    const variance = randomBetween(-5, 5);
    const score = Math.min(99, Math.max(5, baseScore + variance));
    const mentions = Math.floor(score / 10) + randomBetween(0, 5);
    const sentiment = getSentiment(score);
    const visibility = getVisibility(score);
    const topKeywords = generateKeywords(industry, products, geography);
    const sampleResponse = generateSampleResponse(
      companyName,
      products,
      industry,
      geography,
      sentiment
    );

    return {
      ...model,
      score,
      visibility,
      mentions,
      sentiment,
      topKeywords,
      sampleResponse,
    };
  });

  const overallScore = Math.round(
    modelScores.reduce((sum, m) => sum + m.score, 0) / modelScores.length
  );

  const allInsights: Insight[] = [
    {
      type: "strength" as const,
      title: "Brand Recognition in Core Markets",
      description: `${companyName} shows strong AI visibility in ${geography} for ${products.split(",")[0].trim()}, indicating established brand authority in core market segments.`,
      models: modelScores
        .filter((m) => m.sentiment === "positive")
        .map((m) => m.model),
    },
    {
      type: "opportunity" as const,
      title: "Untapped AI Model Coverage",
      description: `Several AI models show limited awareness of ${companyName}'s full product portfolio. Structured content and authoritative sources can improve coverage.`,
      models: modelScores
        .filter((m) => m.visibility === "low" || m.visibility === "none")
        .map((m) => m.model),
    },
    {
      type: "weakness" as const,
      title: "Inconsistent Cross-Model Presence",
      description: `${companyName}'s visibility varies significantly across AI models, suggesting inconsistent training data representation or limited authoritative content.`,
      models: modelScores
        .filter((m) => m.sentiment === "neutral")
        .map((m) => m.model),
    },
    {
      type: "threat" as const,
      title: "Competitive Displacement Risk",
      description: `In ${industry}, AI models may prioritize competitors with more structured, frequently updated content. Without optimization, ${companyName} risks being displaced in AI-generated recommendations.`,
      models: AI_MODELS.slice(0, 2).map((m) => m.model),
    },
  ];
  const insights: Insight[] = allInsights.filter((i) => i.models.length > 0);

  const recommendations: Recommendation[] = [
    {
      priority: "high",
      title: "Create AI-Optimized Content",
      description:
        "Develop structured content that directly answers questions AI models are asked about your industry. Focus on FAQs, comparison guides, and authoritative long-form content.",
      effort: "2–4 weeks",
    },
    {
      priority: "high",
      title: "Build Authoritative Citations",
      description:
        "Get mentioned in high-authority industry publications, Wikipedia, and structured databases. AI models weight authoritative external citations heavily.",
      effort: "4–8 weeks",
    },
    {
      priority: "medium",
      title: "Structured Data Markup",
      description:
        "Implement schema.org markup across your website for Organization, Product, and FAQPage schemas to make your content more parseable by AI crawlers.",
      effort: "1–2 weeks",
    },
    {
      priority: "medium",
      title: "Knowledge Graph Optimization",
      description:
        "Ensure your company has a complete Google Knowledge Panel, updated Wikidata entry, and consistent entity information across the web.",
      effort: "2–3 weeks",
    },
    {
      priority: "low",
      title: "Conversational Content Strategy",
      description:
        "Optimize content for natural language queries. Write content that answers the exact questions prospects ask AI models when looking for solutions in your space.",
      effort: "Ongoing",
    },
  ];

  return {
    overallScore,
    modelScores,
    insights,
    recommendations,
  };
}

export { AI_MODELS };
