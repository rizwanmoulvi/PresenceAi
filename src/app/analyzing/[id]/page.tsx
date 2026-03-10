"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2, Lock, Zap } from "lucide-react";
import {
  OpenAILogo,
  AnthropicLogo,
  GeminiLogo,
  PerplexityLogo,
  GrokLogo,
} from "@/components/BrandLogos";

const AI_MODELS = [
  { id: "chatgpt",    name: "ChatGPT-4o",        Logo: OpenAILogo,     delay: 0    },
  { id: "claude",     name: "Claude 3.5 Sonnet",  Logo: AnthropicLogo,  delay: 1200 },
  { id: "gemini",     name: "Gemini 1.5 Pro",     Logo: GeminiLogo,     delay: 2400 },
  { id: "perplexity", name: "Perplexity AI",      Logo: PerplexityLogo, delay: 3600 },
  { id: "grok",       name: "Grok 2",             Logo: GrokLogo,       delay: 4800 },
];

const MESSAGES = [
  "Querying AI models for brand mentions...",
  "Analyzing sentiment across responses...",
  "Scoring visibility and reach...",
  "Generating competitive insights...",
  "Building your GEO report...",
];

export default function AnalyzingPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [completedModels, setCompletedModels] = useState<Set<string>>(
    new Set()
  );
  const [messageIdx, setMessageIdx] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Simulate each model completing
    const timers: NodeJS.Timeout[] = [];

    AI_MODELS.forEach((model) => {
      const t = setTimeout(() => {
        setCompletedModels((prev) => {
          const next = new Set(prev);
          next.add(model.id);
          return next;
        });
      }, model.delay + 1400);
      timers.push(t);
    });

    // Cycle status messages
    let msgIdx = 0;
    const msgInterval = setInterval(() => {
      msgIdx = (msgIdx + 1) % MESSAGES.length;
      setMessageIdx(msgIdx);
    }, 1600);

    // Redirect after all done
    const finalTimer = setTimeout(() => {
      setDone(true);
      clearInterval(msgInterval);
      setTimeout(() => {
        router.push(`/report/${id}`);
      }, 800);
    }, AI_MODELS[AI_MODELS.length - 1].delay + 2600);

    timers.push(finalTimer);

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(msgInterval);
    };
  }, [id, router]);

  const totalCompleted = completedModels.size;
  const progress = (totalCompleted / AI_MODELS.length) * 100;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-steel-blue-100/40 blur-[140px]" />
      </div>

      <div className="relative w-full max-w-lg text-center">
        {/* Animated Logo */}
        <motion.div
          className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-steel-blue-600 border border-steel-blue-500"
          animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Zap className="h-9 w-9 text-white" strokeWidth={1.5} />
        </motion.div>

        {/* Title */}
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <h1 className="text-3xl font-semibold text-alabaster-grey-900 mb-2">
                Analysis Complete
              </h1>
              <p className="text-alabaster-grey-500">Preparing your report...</p>
            </motion.div>
          ) : (
            <motion.div key="analyzing">
              <h1 className="text-3xl font-semibold text-alabaster-grey-900 mb-2">
                Analyzing your brand
              </h1>
              <AnimatePresence mode="wait">
                <motion.p
                  key={messageIdx}
                  className="text-alabaster-grey-500 text-base"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35 }}
                >
                  {MESSAGES[messageIdx]}
                </motion.p>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress bar */}
        <div className="mt-8 mb-8">
          <div className="flex justify-between text-xs text-alabaster-grey-400 mb-2">
            <span>{totalCompleted} of {AI_MODELS.length} models</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-alabaster-grey-200 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-steel-blue-600"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Model cards */}
        <div className="space-y-3">
          {AI_MODELS.map((model, i) => {
            const isCompleted = completedModels.has(model.id);
            const isActive =
              !isCompleted &&
              (i === 0 || completedModels.has(AI_MODELS[i - 1]?.id));

            return (
              <motion.div
                key={model.id}
                className={`flex items-center gap-4 rounded-xl border px-5 py-4 transition-all duration-500 ${
                  isCompleted
                    ? "border-mint-cream-300 bg-mint-cream-50"
                    : isActive
                    ? "border-steel-blue-400 bg-steel-blue-50"
                    : "border-alabaster-grey-200 bg-white opacity-50"
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: isActive || isCompleted ? 1 : 0.5, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-alabaster-grey-100 border border-alabaster-grey-200 flex-shrink-0">
                  <model.Logo className="h-5 w-5 text-alabaster-grey-600" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-alabaster-grey-800">
                    {model.name}
                  </p>
                  <p className="text-xs text-alabaster-grey-400">
                    {isCompleted
                      ? "Analysis complete"
                      : isActive
                      ? "Scanning now..."
                      : "Waiting..."}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    >
                      <CheckCircle2 className="h-5 w-5 text-mint-cream-600" />
                    </motion.div>
                  ) : isActive ? (
                    <Loader2 className="h-5 w-5 text-steel-blue-600 animate-spin" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-alabaster-grey-300" />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Privacy note */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-alabaster-grey-400">
          <Lock className="h-3 w-3" />
          <span>Your data is analyzed securely and never shared with third parties.</span>
        </div>
      </div>
    </div>
  );
}
