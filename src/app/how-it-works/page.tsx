import Link from "next/link";
import { ArrowRight, Zap, Search, BarChart2, Unlock, CheckCircle2, FlaskConical } from "lucide-react";

export const metadata = {
  title: "How It Works | PresenceAI — AEO Grader",
  description:
    "Learn how the AEO Grader analyzes your brand's visibility, sentiment, and competitive positioning across leading AI answer engines.",
};

const STEPS = [
  {
    number: "01",
    title: "Enter a brand name",
    description:
      "Enter the brand name you want to analyze — whether your own company or a competitor. The Answer Engine Optimization tool accepts any brand operating in your market space, enabling direct competitive intelligence gathering.",
    icon: Search,
  },
  {
    number: "02",
    title: "We query the AI models",
    description:
      "AEO Grader automatically runs queries across GPT-4o, Perplexity, and Gemini, mirroring real customer research patterns. These queries replicate how prospects discover and evaluate brands, capturing authentic AI-generated responses.",
    icon: Zap,
  },
  {
    number: "03",
    title: "Review your brand performance score",
    description:
      "Access your brand performance score calculated across five dimensions: brand recognition strength, competitive market positioning, contextual relevance, sentiment polarity analysis, and citation frequency patterns.",
    icon: BarChart2,
  },
  {
    number: "04",
    title: "Unlock your full assessment",
    description:
      "Complete the form to unlock your full brand assessment, including brand archetype classification, sentiment trend analysis, narrative themes, current competitive advantages, and recommendations for improved AI visibility.",
    icon: Unlock,
  },
];

const FEATURES = [
  {
    icon: "🏆",
    title: "Market Position Assessment",
    description:
      "Our search engine positioning tool's detailed competitive analysis categorizes your brand as a Leader, Challenger, or Niche Player based on how answer engines position you relative to competitors. This analysis examines mention frequency, context quality, and recommendation patterns across different query types.",
  },
  {
    icon: "📊",
    title: "Share of Voice Metrics",
    description:
      "Track your brand's presence in AI-generated responses compared to competitors. When users ask about solutions in your category, how often does your brand appear in the synthesized answer? Which competitors receive more prominent positioning, and what factors drive these differences?",
  },
  {
    icon: "🔍",
    title: "Contextual Brand Analysis",
    description:
      "The AEO Grader examines how answer engines characterize your business across different query contexts. Whether users ask about industry trends, solution comparisons, or specific use cases, we reveal the recurring themes and associations that shape your brand image in AI responses.",
  },
  {
    icon: "💬",
    title: "Multi-Dimensional Sentiment Analysis",
    description:
      "Beyond simple positive/negative scoring, our analysis evaluates general brand sentiment, contextual sentiment across topics, source-based sentiment from credibility standpoint, and polarization metrics.",
  },
  {
    icon: "📖",
    title: "Narrative Patterns & Topic Associations",
    description:
      "Identify the key storylines that answer engines associate with your brand. Understanding these narrative patterns helps you optimize content and messaging for better AI visibility.",
  },
  {
    icon: "🔗",
    title: "Source Credibility Assessment",
    description:
      "Evaluate the quality and authority of sources that answer engines reference when mentioning your brand. High-quality sources from reputable publications and authoritative websites significantly enhance your brand's credibility in AI-generated responses.",
  },
  {
    icon: "📦",
    title: "Data Richness Evaluation",
    description:
      "Assess the variety and completeness of information available about your brand across digital channels. Our analysis identifies information gaps limiting how answer engines represent your company.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ── */}
      <section className="bg-gradient-to-b from-steel-blue-50 to-white border-b border-alabaster-grey-200">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-steel-blue-100 px-4 py-1.5 mb-6">
            <Zap className="h-3.5 w-3.5 text-steel-blue-600" />
            <span className="text-xs font-semibold text-steel-blue-700 uppercase tracking-wide">
              AEO Grader
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-alabaster-grey-900 leading-tight mb-6">
            What is AEO Grader?
          </h1>
          <p className="text-lg text-alabaster-grey-600 leading-relaxed max-w-3xl mx-auto mb-8">
            Optimizing for traditional search is no longer enough. When prospects search for solutions,
            AI systems synthesize information from multiple sources and present consolidated answers —
            often without users ever clicking through to your website. This creates a{" "}
            <strong className="text-alabaster-grey-900">"zero-click funnel"</strong> where your
            brand's representation in AI-generated responses directly determines customer perception
            and purchase decisions.
          </p>
          <p className="text-base text-alabaster-grey-600 leading-relaxed max-w-3xl mx-auto mb-8">
            HubSpot's free Answer Engine Optimization Grader (AEO Grader) analyzes your brand's AI
            visibility, sentiment, and competitive positioning across leading AI platforms including{" "}
            <strong className="text-alabaster-grey-900">GPT-4o, Perplexity, and Gemini</strong>.
            Unlike traditional SEO tools that only measure website traffic, our AI search tool
            reveals how generative AI engines characterize your brand when users ask questions about
            your industry, products, or services.
          </p>
          <p className="text-base text-alabaster-grey-500 leading-relaxed max-w-2xl mx-auto mb-10">
            Don't let answer engines define your brand narrative without your input. Use HubSpot's
            free AI visibility tool to take control of how leading answer engines represent your
            business.
          </p>
          <Link href="/" className="btn-primary inline-flex items-center gap-2 text-base py-3 px-7">
            Grade My Brand Free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── Methodology highlight ── */}
      <section className="bg-steel-blue-600 py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 mb-5">
            <FlaskConical className="h-3.5 w-3.5 text-white" />
            <span className="text-xs font-semibold text-white uppercase tracking-wide">
              Methodology
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Thousands of prompts. One clear picture.
          </h2>
          <p className="text-steel-blue-100 text-base leading-relaxed max-w-2xl mx-auto mb-6">
            Unlike tools that run a handful of static queries, AEO Grader{" "}
            <strong className="text-white">
              prompts AI models thousands of times in different ways
            </strong>{" "}
            — varying phrasing, intent, context, and query type — to build a statistically robust
            picture of how your brand is represented across answer engines.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 text-left">
            {[
              {
                stat: "1,000+",
                label: "Unique prompt variations",
                note: "Per brand analysis",
              },
              {
                stat: "5",
                label: "Leading AI models tested",
                note: "GPT-4o, Claude, Gemini, Perplexity, Grok",
              },
              {
                stat: "7",
                label: "Scoring dimensions",
                note: "Visibility, sentiment, authority & more",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl bg-white/10 border border-white/20 px-5 py-4"
              >
                <p className="text-2xl font-bold text-white mb-1">{item.stat}</p>
                <p className="text-sm font-semibold text-white mb-0.5">{item.label}</p>
                <p className="text-xs text-steel-blue-200">{item.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Competitive landscape ── */}
      <section className="py-16 border-b border-alabaster-grey-200">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-semibold text-steel-blue-600 uppercase tracking-wider">
                Competitive Intelligence
              </span>
              <h2 className="text-3xl font-bold text-alabaster-grey-900 mt-2 mb-4 leading-snug">
                Understand your competitive landscape
              </h2>
              <p className="text-alabaster-grey-600 leading-relaxed mb-6">
                Uncover your competitive position with AEO Grader's powerful capabilities.
              </p>
              <div className="space-y-5">
                <div className="flex gap-4">
                  <CheckCircle2 className="h-5 w-5 text-steel-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-alabaster-grey-900 text-sm">
                      Market Position Assessment
                    </p>
                    <p className="text-sm text-alabaster-grey-500 mt-1 leading-relaxed">
                      Our search engine positioning tool's detailed competitive analysis categorizes
                      your brand as a <strong>Leader, Challenger, or Niche Player</strong> based on
                      how answer engines position you relative to competitors. This analysis examines
                      mention frequency, context quality, and recommendation patterns across different
                      query types.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <CheckCircle2 className="h-5 w-5 text-steel-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-alabaster-grey-900 text-sm">
                      Share of Voice Metrics
                    </p>
                    <p className="text-sm text-alabaster-grey-500 mt-1 leading-relaxed">
                      Track your brand's presence in AI-generated responses compared to competitors.
                      Get answers to key questions: When users ask about solutions in your category,
                      how often does your brand appear in the synthesized answer? Which competitors
                      receive more prominent positioning, and what factors drive these differences?
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl bg-alabaster-grey-50 border border-alabaster-grey-200 p-8">
              <div className="space-y-3">
                {[
                  { label: "Your Brand", pct: 34, color: "bg-steel-blue-500" },
                  { label: "Competitor A", pct: 28, color: "bg-soft-linen-400" },
                  { label: "Competitor B", pct: 22, color: "bg-sandy-brown-400" },
                  { label: "Others", pct: 16, color: "bg-alabaster-grey-300" },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-alabaster-grey-700">{item.label}</span>
                      <span className="font-semibold text-alabaster-grey-900">{item.pct}%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-alabaster-grey-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.color}`}
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-alabaster-grey-400 mt-4 text-center">
                Share of Voice — AI-generated responses
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Brand narrative & perception ── */}
      <section className="py-16 bg-soft-linen-50 border-b border-alabaster-grey-200">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 rounded-2xl bg-white border border-alabaster-grey-200 p-6 space-y-4">
              {[
                { label: "General Brand Sentiment", score: 82, color: "bg-mint-cream-500" },
                { label: "Contextual Sentiment", score: 74, color: "bg-steel-blue-400" },
                { label: "Source-Based Sentiment", score: 68, color: "bg-sandy-brown-400" },
                { label: "Narrative Polarity", score: 79, color: "bg-soft-linen-500" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium text-alabaster-grey-700">{item.label}</span>
                    <span className="font-bold text-alabaster-grey-900">{item.score}/100</span>
                  </div>
                  <div className="h-2 rounded-full bg-alabaster-grey-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color}`}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
              ))}
              <p className="text-xs text-alabaster-grey-400 text-center pt-1">
                Multi-dimensional sentiment breakdown
              </p>
            </div>
            <div className="order-1 lg:order-2">
              <span className="text-xs font-semibold text-steel-blue-600 uppercase tracking-wider">
                Brand Perception
              </span>
              <h2 className="text-3xl font-bold text-alabaster-grey-900 mt-2 mb-4 leading-snug">
                Discover your brand's narrative and perception in AI results
              </h2>
              <p className="text-alabaster-grey-600 leading-relaxed mb-6">
                This AI visibility tool breaks down your narrative and perception into granular
                categories so you can act on what's actually driving your AI representation.
              </p>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-alabaster-grey-900 text-sm">
                    Contextual Brand Analysis
                  </p>
                  <p className="text-sm text-alabaster-grey-500 mt-1 leading-relaxed">
                    The AEO Grader examines how answer engines characterize your business across
                    different query contexts — industry trends, solution comparisons, or specific
                    use cases.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-alabaster-grey-900 text-sm">
                    Sentiment Analysis — 4 Dimensions
                  </p>
                  <ul className="text-sm text-alabaster-grey-500 mt-1 leading-relaxed space-y-1 pl-4 list-disc">
                    <li>General Brand Sentiment: overall tone when your brand is mentioned</li>
                    <li>Contextual Sentiment: how sentiment varies across topics or use cases</li>
                    <li>Source-Based Sentiment: quality and credibility of influencing sources</li>
                    <li>Narrative Patterns: key storylines answer engines associate with your brand</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── AI performance ── */}
      <section className="py-16 border-b border-alabaster-grey-200">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-semibold text-steel-blue-600 uppercase tracking-wider">
                Actionable Insights
              </span>
              <h2 className="text-3xl font-bold text-alabaster-grey-900 mt-2 mb-4 leading-snug">
                Maximize your answer engine performance
              </h2>
              <p className="text-alabaster-grey-600 leading-relaxed mb-4">
                Receive a detailed analysis of your brand's current AI visibility, including
                specific examples of how different answer engines describe your company, products,
                and competitive advantages.
              </p>
              <p className="text-alabaster-grey-600 leading-relaxed mb-6">
                The AEO Grader audit reveals critical opportunities and content gaps that directly
                impact how millions of users discover and evaluate your brand.
              </p>
              <p className="text-alabaster-grey-600 leading-relaxed">
                Use insights from the Answer Engine Optimization Grader to develop a comprehensive
                strategy for improving your brand's perception. Embark on your answer engine
                optimization journey with actionable guidance that helps you systematically improve
                your brand's representation across all major platforms.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Brand Recognition", score: "A+", sub: "Strong awareness" },
                { label: "Market Position", score: "B+", sub: "Challenger tier" },
                { label: "Sentiment Score", score: "78", sub: "Predominantly positive" },
                { label: "Citation Frequency", score: "42%", sub: "Of category queries" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-alabaster-grey-200 bg-white p-4 text-center"
                >
                  <p className="text-3xl font-bold text-steel-blue-600 mb-1">{item.score}</p>
                  <p className="text-xs font-semibold text-alabaster-grey-800">{item.label}</p>
                  <p className="text-xs text-alabaster-grey-400 mt-0.5">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Source quality ── */}
      <section className="py-16 bg-soft-linen-50 border-b border-alabaster-grey-200">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-semibold text-steel-blue-600 uppercase tracking-wider">
              Source Intelligence
            </span>
            <h2 className="text-3xl font-bold text-alabaster-grey-900 mt-2 mb-3">
              Track source quality and information authority
            </h2>
            <p className="text-alabaster-grey-500 text-base max-w-2xl mx-auto leading-relaxed">
              Evaluate the credibility of sources referencing your brand with these features.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-white border border-alabaster-grey-200 p-6">
              <h3 className="font-bold text-alabaster-grey-900 mb-3 text-base">
                Source Credibility Assessment
              </h3>
              <p className="text-sm text-alabaster-grey-500 leading-relaxed">
                Evaluate the quality and authority of sources that answer engines reference when
                mentioning your brand. High-quality sources from reputable publications and
                authoritative websites significantly enhance your brand's credibility in
                AI-generated responses.
              </p>
            </div>
            <div className="rounded-2xl bg-white border border-alabaster-grey-200 p-6">
              <h3 className="font-bold text-alabaster-grey-900 mb-3 text-base">
                Data Richness Evaluation
              </h3>
              <p className="text-sm text-alabaster-grey-500 leading-relaxed">
                Assess the variety and completeness of information available about your brand across
                digital channels. Our search engine visibility tool's analysis identifies
                information gaps limiting how answer engines represent your company.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Steps ── */}
      <section className="py-20 border-b border-alabaster-grey-200">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold text-steel-blue-600 uppercase tracking-wider">
              How to use it
            </span>
            <h2 className="text-3xl font-bold text-alabaster-grey-900 mt-2 mb-3">
              How to Use HubSpot's AEO Grader
            </h2>
            <p className="text-alabaster-grey-500 text-base max-w-xl mx-auto">
              Follow these four steps to evaluate your brand performance and how it shows up in
              answer engine results.
            </p>
          </div>
          <div className="space-y-8">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="flex gap-6 items-start">
                  <div className="shrink-0 flex flex-col items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-steel-blue-600 text-white font-bold text-sm">
                      <Icon className="h-5 w-5" />
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className="w-px flex-1 bg-alabaster-grey-200 mt-2 h-8" />
                    )}
                  </div>
                  <div className="pb-8">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-bold text-steel-blue-500 font-mono">
                        Step {step.number}
                      </span>
                    </div>
                    <h3 className="font-bold text-alabaster-grey-900 text-lg mb-2">
                      {step.title}
                    </h3>
                    <p className="text-alabaster-grey-500 leading-relaxed text-sm">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── All features grid ── */}
      <section className="py-16 bg-alabaster-grey-50 border-b border-alabaster-grey-200">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-alabaster-grey-900 mb-3">
              Everything included, free
            </h2>
            <p className="text-alabaster-grey-500 text-base max-w-xl mx-auto">
              Every analysis surface the full spectrum of AEO insights — no paid upgrade required
              to see your score.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl bg-white border border-alabaster-grey-200 p-5"
              >
                <span className="text-2xl mb-3 block">{feature.icon}</span>
                <h3 className="font-semibold text-alabaster-grey-900 text-sm mb-2">
                  {feature.title}
                </h3>
                <p className="text-xs text-alabaster-grey-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="text-3xl font-bold text-alabaster-grey-900 mb-4">
            Ready to see how AI sees your brand?
          </h2>
          <p className="text-alabaster-grey-500 text-base mb-8 leading-relaxed">
            Get your free AEO score in under 2 minutes. No credit card required.
          </p>
          <Link
            href="/"
            className="btn-primary inline-flex items-center gap-2 text-base py-3.5 px-8"
          >
            Grade My Brand Free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

    </div>
  );
}
