"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Send,
  CheckCircle2,
  Archive,
  Mail,
  MapPin,
  Briefcase,
  Package,
  TrendingUp,
  Clock,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Suspense } from "react";

// ── types ──────────────────────────────────────────────────────────────────────

interface Analysis {
  id: string;
  companyName: string;
  industry: string;
  geography: string;
  products: string;
  overallScore: number;
  modelScores: string;
  recommendations: string;
  createdAt: string;
}

interface Lead {
  id: string;
  email: string;
  company: string | null;
  industry: string | null;
  geography: string | null;
  products: string | null;
  score: number | null;
  topRec: string | null;
  emailStatus: string;
  emailSentAt: string | null;
  emailSubject: string | null;
  emailBodyText: string | null;
  emailBodyHtml: string | null;
  notes: string | null;
  createdAt: string;
  analysis: Analysis;
}

// ── helpers ────────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-sandy-brown-50 text-sandy-brown-700 border-sandy-brown-200",
  sent: "bg-steel-blue-50 text-steel-blue-700 border-steel-blue-200",
  replied: "bg-mint-cream-50 text-mint-cream-700 border-mint-cream-200",
  archived: "bg-alabaster-grey-100 text-alabaster-grey-500 border-alabaster-grey-200",
};

// ── page ───────────────────────────────────────────────────────────────────────

function LeadDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id as string;
  const secret = searchParams.get("secret") ?? "";

  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"text" | "html">("text");
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [sending, setSending] = useState(false);
  const [actionMsg, setActionMsg] = useState("");

  useEffect(() => {
    const fetchLead = async () => {
      const res = await fetch(`/api/admin/leads/${id}?secret=${secret}`);
      if (res.status === 401) {
        setError("Unauthorized");
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setError("Lead not found");
        setLoading(false);
        return;
      }
      const data = (await res.json()) as Lead;
      setLead(data);
      setNotes(data.notes ?? "");
      setLoading(false);
    };
    fetchLead();
  }, [id, secret]);

  const patch = async (body: Record<string, unknown>) => {
    const res = await fetch(`/api/admin/leads/${id}?secret=${secret}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.json() as Promise<{ success: boolean; lead?: Lead; error?: string }>;
  };

  const handleSend = async () => {
    if (!confirm(`Send email to ${lead?.email}?`)) return;
    setSending(true);
    const res = await patch({ sendNow: true });
    setSending(false);
    if (res.success && res.lead) {
      setLead(res.lead);
      setActionMsg("Email sent successfully!");
      setTimeout(() => setActionMsg(""), 3000);
    } else {
      setActionMsg(`Error: ${res.error}`);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    const res = await patch({ emailStatus: newStatus });
    if (res.success && res.lead) {
      setLead(res.lead);
    }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    await patch({ notes });
    setSavingNotes(false);
    setActionMsg("Notes saved.");
    setTimeout(() => setActionMsg(""), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-steel-blue-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-10 w-10 text-sandy-brown-500 mx-auto mb-3" />
          <p className="text-alabaster-grey-700 font-semibold">{error || "Lead not found"}</p>
        </div>
      </div>
    );
  }

  const modelScores = lead.analysis?.modelScores
    ? JSON.parse(lead.analysis.modelScores)
    : [];

  return (
    <div className="min-h-screen bg-soft-linen-50">
      {/* Header */}
      <div className="bg-white border-b border-alabaster-grey-200 sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push(`/admin/leads?secret=${secret}`)}
            className="flex items-center gap-1.5 text-sm text-alabaster-grey-500 hover:text-alabaster-grey-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            All Leads
          </button>
          <div className="h-4 w-px bg-alabaster-grey-200" />
          <h1 className="font-semibold text-alabaster-grey-900 truncate">
            {lead.company ?? lead.email}
          </h1>
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ml-auto",
              STATUS_COLORS[lead.emailStatus] ?? STATUS_COLORS.pending
            )}
          >
            {lead.emailStatus}
          </span>
        </div>
      </div>

      {/* Action message */}
      {actionMsg && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-mint-cream-50 border border-mint-cream-200 text-mint-cream-700 text-sm">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            {actionMsg}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 grid lg:grid-cols-3 gap-6">
        {/* Left: Email draft */}
        <div className="lg:col-span-2 space-y-4">
          <motion.div
            className="bg-white rounded-xl border border-alabaster-grey-200 overflow-hidden"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="px-5 py-4 border-b border-alabaster-grey-200 flex items-start gap-4">
              <div className="flex-1">
                <p className="text-xs font-semibold text-alabaster-grey-500 uppercase tracking-wide mb-1">
                  Subject
                </p>
                <p className="font-semibold text-alabaster-grey-900">
                  {lead.emailSubject ?? "Generating draft..."}
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {(["text", "html"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                      tab === t
                        ? "bg-steel-blue-600 text-white border-steel-blue-600"
                        : "bg-white text-alabaster-grey-500 border-alabaster-grey-200 hover:bg-alabaster-grey-50"
                    )}
                  >
                    {t === "text" ? "Text" : "HTML"}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5">
              {tab === "text" ? (
                <pre className="text-sm text-alabaster-grey-700 whitespace-pre-wrap font-sans leading-relaxed min-h-[200px]">
                  {lead.emailBodyText ?? "No draft generated yet. This is created automatically when the lead unlocks their report."}
                </pre>
              ) : lead.emailBodyHtml ? (
                <iframe
                  srcDoc={lead.emailBodyHtml}
                  className="w-full rounded-lg border border-alabaster-grey-200"
                  style={{ height: 480 }}
                  sandbox="allow-same-origin"
                />
              ) : (
                <p className="text-sm text-alabaster-grey-400 min-h-[200px] flex items-center justify-center">
                  No HTML draft yet.
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="px-5 py-4 border-t border-alabaster-grey-200 bg-alabaster-grey-50 flex flex-wrap gap-2 items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-alabaster-grey-400">
                {lead.emailSentAt ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-mint-cream-600" />
                    Sent {new Date(lead.emailSentAt).toLocaleString()}
                  </>
                ) : (
                  <>
                    <Clock className="h-3.5 w-3.5" />
                    Draft · Not sent yet
                  </>
                )}
              </div>
              <div className="flex gap-2">
                {lead.emailStatus !== "archived" && (
                  <button
                    onClick={() => handleStatusChange("archived")}
                    className="btn-secondary flex items-center gap-1.5 px-3 py-1.5 text-xs"
                  >
                    <Archive className="h-3.5 w-3.5" />
                    Archive
                  </button>
                )}
                {lead.emailStatus === "sent" && (
                  <button
                    onClick={() => handleStatusChange("replied")}
                    className="btn-secondary flex items-center gap-1.5 px-3 py-1.5 text-xs"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Mark Replied
                  </button>
                )}
                {lead.emailStatus === "pending" && (
                  <button
                    onClick={handleSend}
                    disabled={sending || !lead.emailBodyText}
                    className="btn-primary flex items-center gap-1.5 px-4 py-1.5 text-sm"
                  >
                    {sending ? (
                      <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                    {sending ? "Sending..." : "Send Email"}
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Notes */}
          <motion.div
            className="bg-white rounded-xl border border-alabaster-grey-200 p-5"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <label className="block text-xs font-semibold text-alabaster-grey-500 uppercase tracking-wide mb-3">
              Internal Notes
            </label>
            <textarea
              className="w-full text-sm rounded-lg border border-alabaster-grey-200 p-3 resize-none focus:outline-none focus:ring-2 focus:ring-steel-blue-300"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this lead, call outcomes, follow-up reminders..."
            />
            <button
              onClick={handleSaveNotes}
              disabled={savingNotes}
              className="mt-2 btn-secondary px-4 py-1.5 text-sm"
            >
              {savingNotes ? "Saving..." : "Save Notes"}
            </button>
          </motion.div>
        </div>

        {/* Right: Company profile */}
        <div className="space-y-4">
          {/* Profile card */}
          <motion.div
            className="bg-white rounded-xl border border-alabaster-grey-200 p-5"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <h2 className="text-sm font-semibold text-alabaster-grey-900 mb-4">
              Company Profile
            </h2>
            <div className="space-y-3">
              {[
                { icon: <Mail className="h-4 w-4" />, label: "Email", value: lead.email },
                { icon: <Briefcase className="h-4 w-4" />, label: "Industry", value: lead.industry },
                { icon: <MapPin className="h-4 w-4" />, label: "Geography", value: lead.geography },
                { icon: <Package className="h-4 w-4" />, label: "Products", value: lead.products },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex gap-3">
                  <span className="flex-shrink-0 mt-0.5 text-alabaster-grey-400">{icon}</span>
                  <div>
                    <p className="text-xs text-alabaster-grey-400">{label}</p>
                    <p className="text-sm text-alabaster-grey-800 mt-0.5">{value ?? "—"}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* AEO Score */}
          <motion.div
            className="bg-white rounded-xl border border-alabaster-grey-200 p-5"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-alabaster-grey-900">
                AEO Score
              </h2>
              <TrendingUp className="h-4 w-4 text-alabaster-grey-400" />
            </div>
            <div className="flex items-baseline gap-1 mb-4">
              <span
                className={cn(
                  "text-4xl font-bold",
                  (lead.score ?? 0) >= 60
                    ? "text-mint-cream-600"
                    : (lead.score ?? 0) >= 35
                    ? "text-steel-blue-600"
                    : "text-sandy-brown-600"
                )}
              >
                {lead.score ?? "—"}
              </span>
              <span className="text-alabaster-grey-400">/100</span>
            </div>

            {modelScores.length > 0 && (
              <div className="space-y-2">
                {modelScores.map(
                  (m: { model: string; score: number }) => (
                    <div key={m.model} className="flex items-center gap-2">
                      <span className="text-xs text-alabaster-grey-500 w-28 truncate">
                        {m.model}
                      </span>
                      <div className="flex-1 h-1.5 rounded-full bg-alabaster-grey-100 overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            m.score >= 60
                              ? "bg-mint-cream-500"
                              : m.score >= 35
                              ? "bg-steel-blue-500"
                              : "bg-sandy-brown-500"
                          )}
                          style={{ width: `${m.score}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-alabaster-grey-700 w-8 text-right">
                        {m.score}
                      </span>
                    </div>
                  )
                )}
              </div>
            )}
          </motion.div>

          {/* Top recommendation */}
          {lead.topRec && (
            <motion.div
              className="bg-steel-blue-50 rounded-xl border border-steel-blue-200 p-5"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <p className="text-xs font-semibold text-steel-blue-600 uppercase tracking-wide mb-2">
                Top Recommendation
              </p>
              <p className="text-sm text-steel-blue-900 font-medium leading-snug">
                {lead.topRec}
              </p>
            </motion.div>
          )}

          {/* Meta */}
          <div className="text-xs text-alabaster-grey-400 px-1 space-y-1">
            <p>Lead created: {new Date(lead.createdAt).toLocaleString()}</p>
            {lead.analysis?.createdAt && (
              <p>Analysis run: {new Date(lead.analysis.createdAt).toLocaleString()}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LeadDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-steel-blue-400 border-t-transparent animate-spin" />
        </div>
      }
    >
      <LeadDetailContent />
    </Suspense>
  );
}
