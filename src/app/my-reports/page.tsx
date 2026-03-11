"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  ArrowRight,
  BarChart2,
  Globe,
  TrendingUp,
  Clock,
  ExternalLink,
  Search,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Report {
  analysisId: string;
  company: string;
  industry: string;
  geography: string;
  score: number;
  status: string;
  createdAt: string;
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 60
      ? "bg-mint-cream-50 text-mint-cream-700 border-mint-cream-200"
      : score >= 35
      ? "bg-steel-blue-50 text-steel-blue-700 border-steel-blue-200"
      : "bg-sandy-brown-50 text-sandy-brown-700 border-sandy-brown-200";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-sm font-bold tabular-nums",
        color
      )}
    >
      {Math.round(score)}
    </span>
  );
}

function ScoreBar({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, score));
  const color =
    pct >= 60 ? "bg-mint-cream-500" : pct >= 35 ? "bg-steel-blue-500" : "bg-sandy-brown-400";
  return (
    <div className="h-1.5 w-full rounded-full bg-alabaster-grey-100 overflow-hidden">
      <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function MyReportsPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed.match(/^[^@]+@[^@]+\.[^@]+$/)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setLoading(true);
    setReports([]);

    try {
      const res = await fetch(`/api/my-reports?email=${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to fetch reports");
      setReports(data.reports);
      setSubmitted(trimmed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-soft-linen-50">
      {/* Header */}
      <div className="bg-white border-b border-alabaster-grey-200">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-steel-blue-600">
              <BarChart2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-alabaster-grey-900">My Reports</h1>
              <p className="text-sm text-alabaster-grey-500">
                Enter the email you used to unlock your reports
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2 mt-6">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-alabaster-grey-400" />
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                className="pl-10 w-full text-sm"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm"
            >
              {loading ? (
                <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Find Reports
            </button>
          </form>

          {error && (
            <div className="mt-3 flex items-center gap-2 text-sm text-sandy-brown-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {submitted && !loading && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {reports.length === 0 ? (
                <div className="rounded-2xl bg-white border border-alabaster-grey-200 p-12 text-center">
                  <BarChart2 className="h-10 w-10 text-alabaster-grey-300 mx-auto mb-3" />
                  <p className="font-semibold text-alabaster-grey-700">No reports found</p>
                  <p className="text-sm text-alabaster-grey-400 mt-1 mb-6">
                    No analyses were unlocked with <strong>{submitted}</strong>.
                  </p>
                  <Link href="/" className="btn-primary inline-flex items-center gap-2 text-sm py-2.5 px-5">
                    Analyze a Brand
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : (
                <>
                  <p className="text-sm text-alabaster-grey-500 mb-4">
                    Found <strong className="text-alabaster-grey-900">{reports.length}</strong> report
                    {reports.length !== 1 ? "s" : ""} for{" "}
                    <strong className="text-alabaster-grey-900">{submitted}</strong>
                  </p>
                  <div className="space-y-3">
                    {reports.map((report, i) => (
                      <motion.div
                        key={report.analysisId}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-white rounded-2xl border border-alabaster-grey-200 p-5 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                              <h2 className="font-bold text-alabaster-grey-900 text-base truncate">
                                {report.company}
                              </h2>
                              <ScoreBadge score={report.score} />
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-alabaster-grey-500 mb-3">
                              <span className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                {report.industry}
                              </span>
                              <span className="flex items-center gap-1">
                                <Globe className="h-3 w-3" />
                                {report.geography}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(report.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                            <ScoreBar score={report.score} />
                            <p className="text-xs text-alabaster-grey-400 mt-1">
                              AEO Score: {Math.round(report.score)}/100
                            </p>
                          </div>
                          <Link
                            href={`/report/${report.analysisId}`}
                            className="shrink-0 flex items-center gap-1.5 text-sm font-medium text-steel-blue-600 hover:text-steel-blue-700 transition-colors mt-0.5"
                          >
                            View Report
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-8 text-center">
                    <p className="text-sm text-alabaster-grey-500 mb-3">Want to analyze another brand?</p>
                    <Link href="/" className="btn-primary inline-flex items-center gap-2 text-sm py-2.5 px-5">
                      New Analysis
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {!submitted && !loading && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl bg-white border border-alabaster-grey-200 p-12 text-center"
            >
              <Mail className="h-10 w-10 text-alabaster-grey-300 mx-auto mb-3" />
              <p className="font-semibold text-alabaster-grey-700">Enter your email above</p>
              <p className="text-sm text-alabaster-grey-400 mt-1">
                We'll show all reports you previously unlocked with that address.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
