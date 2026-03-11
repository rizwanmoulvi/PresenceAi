"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Mail,
  Send,
  Eye,
  Archive,
  CheckCircle2,
  Clock,
  TrendingUp,
  Users,
  Search,
  RefreshCw,
  ChevronRight,
  AlertCircle,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Suspense } from "react";

// ── types ──────────────────────────────────────────────────────────────────────

interface Lead {
  id: string;
  email: string;
  company: string | null;
  industry: string | null;
  geography: string | null;
  score: number | null;
  topRec: string | null;
  emailStatus: string;
  emailSentAt: string | null;
  emailSubject: string | null;
  emailBodyText: string | null;
  emailBodyHtml: string | null;
  notes: string | null;
  createdAt: string;
}

interface Stats {
  total: number;
  pending: number;
  sent: number;
  replied: number;
  archived: number;
  avgScore: number;
}

interface ApiResponse {
  leads: Lead[];
  total: number;
  stats: Stats;
}

// ── helpers ────────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  pending: {
    label: "Pending",
    color: "bg-sandy-brown-50 text-sandy-brown-700 border-sandy-brown-200",
    icon: <Clock className="h-3 w-3" />,
  },
  sent: {
    label: "Sent",
    color: "bg-steel-blue-50 text-steel-blue-700 border-steel-blue-200",
    icon: <Send className="h-3 w-3" />,
  },
  replied: {
    label: "Replied",
    color: "bg-mint-cream-50 text-mint-cream-700 border-mint-cream-200",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  archived: {
    label: "Archived",
    color: "bg-alabaster-grey-100 text-alabaster-grey-500 border-alabaster-grey-200",
    icon: <Archive className="h-3 w-3" />,
  },
};

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-alabaster-grey-300">—</span>;
  const color =
    score >= 60
      ? "bg-mint-cream-50 text-mint-cream-700"
      : score >= 35
      ? "bg-steel-blue-50 text-steel-blue-700"
      : "bg-sandy-brown-50 text-sandy-brown-700";
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold", color)}>
      {score}
    </span>
  );
}

function StatusChip({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
        cfg.color
      )}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

// ── email preview modal ────────────────────────────────────────────────────────

function EmailPreviewModal({
  lead,
  secret,
  onClose,
  onSent,
}: {
  lead: Lead;
  secret: string;
  onClose: () => void;
  onSent: (id: string) => void;
}) {
  const [tab, setTab] = useState<"text" | "html">("text");
  const [sending, setSending] = useState(false);
  const [notes, setNotes] = useState(lead.notes ?? "");
  const [savingNotes, setSavingNotes] = useState(false);

  const handleSend = async () => {
    if (!confirm(`Send email to ${lead.email}?`)) return;
    setSending(true);
    const res = await fetch(`/api/admin/leads/${lead.id}?secret=${secret}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sendNow: true }),
    });
    setSending(false);
    if (res.ok) {
      onSent(lead.id);
      onClose();
    } else {
      const err = await res.json();
      alert(err.error ?? "Send failed");
    }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    await fetch(`/api/admin/leads/${lead.id}?secret=${secret}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
    setSavingNotes(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        className="bg-white rounded-2xl border border-alabaster-grey-200 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {/* Header */}
        <div className="flex items-start gap-4 px-6 py-4 border-b border-alabaster-grey-200">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-alabaster-grey-900 truncate">
              {lead.company ?? lead.email}
            </p>
            <p className="text-sm text-alabaster-grey-500 truncate">{lead.email}</p>
            <p className="text-sm text-alabaster-grey-700 mt-1">
              Subject: <span className="font-medium">{lead.emailSubject ?? "—"}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1.5 rounded-lg hover:bg-alabaster-grey-100 text-alabaster-grey-400"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-6 pt-3 pb-0 border-b border-alabaster-grey-200">
          {(["text", "html"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-t-lg border border-b-0 -mb-px transition-colors",
                tab === t
                  ? "bg-white border-alabaster-grey-200 text-alabaster-grey-900"
                  : "border-transparent text-alabaster-grey-400 hover:text-alabaster-grey-600"
              )}
            >
              {t === "text" ? "Plain Text" : "HTML Preview"}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {tab === "text" ? (
            <pre className="text-sm text-alabaster-grey-700 whitespace-pre-wrap font-sans leading-relaxed">
              {lead.emailBodyText ?? "No draft generated yet."}
            </pre>
          ) : lead.emailBodyHtml ? (
            <iframe
              srcDoc={lead.emailBodyHtml}
              className="w-full rounded-lg border border-alabaster-grey-200"
              style={{ height: 400 }}
              sandbox="allow-same-origin"
            />
          ) : (
            <p className="text-sm text-alabaster-grey-400">No HTML draft.</p>
          )}

          {/* Notes */}
          <div className="mt-6 pt-4 border-t border-alabaster-grey-200">
            <label className="block text-xs font-semibold text-alabaster-grey-500 uppercase tracking-wide mb-2">
              Internal Notes
            </label>
            <textarea
              className="w-full text-sm rounded-lg border border-alabaster-grey-200 p-3 resize-none focus:outline-none focus:ring-2 focus:ring-steel-blue-300"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this lead..."
            />
            <button
              onClick={handleSaveNotes}
              disabled={savingNotes}
              className="mt-2 text-xs text-steel-blue-600 hover:underline disabled:opacity-50"
            >
              {savingNotes ? "Saving..." : "Save notes"}
            </button>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-alabaster-grey-200 bg-alabaster-grey-50">
          <div className="flex items-center gap-2">
            <StatusChip status={lead.emailStatus} />
            {lead.emailSentAt && (
              <span className="text-xs text-alabaster-grey-400">
                Sent {new Date(lead.emailSentAt).toLocaleDateString()}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="btn-secondary px-4 py-2 text-sm"
            >
              Close
            </button>
            {lead.emailStatus === "pending" && (
              <button
                onClick={handleSend}
                disabled={sending || !lead.emailBodyText}
                className="btn-primary px-4 py-2 text-sm"
              >
                {sending ? (
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                {sending ? "Sending..." : "Send Now"}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── main page ──────────────────────────────────────────────────────────────────

function AdminLeadsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const secret = searchParams.get("secret") ?? "";

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ secret });
    if (statusFilter) params.set("status", statusFilter);
    if (search) params.set("search", search);

    const res = await fetch(`/api/admin/leads?${params}`);
    if (res.status === 401) {
      setError("Unauthorized — check your admin secret.");
      setLoading(false);
      return;
    }
    const json = (await res.json()) as ApiResponse;
    setData(json);
    setLoading(false);
  }, [secret, statusFilter, search]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleSent = (id: string) => {
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        leads: prev.leads.map((l) =>
          l.id === id ? { ...l, emailStatus: "sent", emailSentAt: new Date().toISOString() } : l
        ),
      };
    });
  };

  const handleStatusChange = async (lead: Lead, newStatus: string) => {
    await fetch(`/api/admin/leads/${lead.id}?secret=${secret}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailStatus: newStatus }),
    });
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        leads: prev.leads.map((l) =>
          l.id === lead.id ? { ...l, emailStatus: newStatus } : l
        ),
      };
    });
  };

  if (!secret) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-10 w-10 text-sandy-brown-500 mx-auto mb-3" />
          <p className="text-alabaster-grey-700 font-semibold">Admin secret required</p>
          <p className="text-alabaster-grey-400 text-sm mt-1">
            Add <code className="bg-alabaster-grey-100 px-1 rounded">?secret=YOUR_ADMIN_SECRET</code> to the URL
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft-linen-50">
      {/* Header */}
      <div className="bg-white border-b border-alabaster-grey-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-alabaster-grey-900">
              Lead Dashboard
            </h1>
            <p className="text-sm text-alabaster-grey-500 mt-0.5">
              B2B leads captured via report unlock gate · AI SDR pipeline
            </p>
          </div>
          <button
            onClick={fetchLeads}
            className="btn-secondary flex items-center gap-2 px-4 py-2 text-sm"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            Refresh
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Stats */}
        {data && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Total Leads", value: data.stats.total, icon: <Users className="h-4 w-4" />, color: "text-alabaster-grey-700" },
              { label: "Pending", value: data.stats.pending, icon: <Clock className="h-4 w-4" />, color: "text-sandy-brown-600" },
              { label: "Sent", value: data.stats.sent, icon: <Send className="h-4 w-4" />, color: "text-steel-blue-600" },
              { label: "Replied", value: data.stats.replied, icon: <CheckCircle2 className="h-4 w-4" />, color: "text-mint-cream-600" },
              { label: "Archived", value: data.stats.archived, icon: <Archive className="h-4 w-4" />, color: "text-alabaster-grey-400" },
              { label: "Avg Score", value: data.stats.avgScore, icon: <TrendingUp className="h-4 w-4" />, color: "text-steel-blue-600" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-xl border border-alabaster-grey-200 p-4"
              >
                <div className={cn("flex items-center gap-1.5 text-xs font-medium mb-2", stat.color)}>
                  {stat.icon}
                  {stat.label}
                </div>
                <p className="text-2xl font-bold text-alabaster-grey-900">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-alabaster-grey-400" />
            <input
              type="text"
              placeholder="Search company or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-full text-sm"
            />
          </div>
          <div className="flex gap-1.5">
            {["", "pending", "sent", "replied", "archived"].map((s) => (
              <button
                key={s || "all"}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors",
                  statusFilter === s
                    ? "bg-steel-blue-600 text-white border-steel-blue-600"
                    : "bg-white text-alabaster-grey-600 border-alabaster-grey-200 hover:bg-alabaster-grey-50"
                )}
              >
                {s ? s.charAt(0).toUpperCase() + s.slice(1) : "All"}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-4 rounded-xl bg-sandy-brown-50 border border-sandy-brown-200 text-sandy-brown-700 text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="bg-white rounded-xl border border-alabaster-grey-200 p-12 text-center">
            <div className="mx-auto h-8 w-8 rounded-full border-2 border-steel-blue-400 border-t-transparent animate-spin mb-3" />
            <p className="text-alabaster-grey-500 text-sm">Loading leads...</p>
          </div>
        ) : data && data.leads.length > 0 ? (
          <div className="bg-white rounded-xl border border-alabaster-grey-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-alabaster-grey-200 bg-alabaster-grey-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-alabaster-grey-500 uppercase tracking-wide">Company</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-alabaster-grey-500 uppercase tracking-wide">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-alabaster-grey-500 uppercase tracking-wide">Industry</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-alabaster-grey-500 uppercase tracking-wide">Score</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-alabaster-grey-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-alabaster-grey-500 uppercase tracking-wide">Date</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {data.leads.map((lead, i) => (
                  <motion.tr
                    key={lead.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className={cn(
                      "border-b border-alabaster-grey-100 hover:bg-alabaster-grey-50 transition-colors group",
                      i === data.leads.length - 1 && "border-b-0"
                    )}
                  >
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-alabaster-grey-900 truncate max-w-[160px]">
                        {lead.company ?? "—"}
                      </p>
                      {lead.geography && (
                        <p className="text-xs text-alabaster-grey-400">{lead.geography}</p>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-alabaster-grey-600 truncate max-w-[200px]">{lead.email}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-alabaster-grey-600 truncate max-w-[120px]">
                        {lead.industry ?? "—"}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <ScoreBadge score={lead.score} />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <StatusChip status={lead.emailStatus} />
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-alabaster-grey-400 whitespace-nowrap">
                      {new Date(lead.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setSelectedLead(lead)}
                          title="Preview email"
                          className="p-1.5 rounded-lg hover:bg-steel-blue-50 text-alabaster-grey-400 hover:text-steel-blue-600 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {lead.emailStatus === "pending" && (
                          <button
                            onClick={() => setSelectedLead(lead)}
                            title="Send email"
                            className="p-1.5 rounded-lg hover:bg-steel-blue-50 text-alabaster-grey-400 hover:text-steel-blue-600 transition-colors"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                        )}
                        {lead.emailStatus === "sent" && (
                          <button
                            onClick={() => handleStatusChange(lead, "replied")}
                            title="Mark as replied"
                            className="p-1.5 rounded-lg hover:bg-mint-cream-50 text-alabaster-grey-400 hover:text-mint-cream-600 transition-colors"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() =>
                            router.push(`/admin/leads/${lead.id}?secret=${secret}`)
                          }
                          title="View detail"
                          className="p-1.5 rounded-lg hover:bg-alabaster-grey-100 text-alabaster-grey-400 hover:text-alabaster-grey-600 transition-colors"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            <div className="px-5 py-3 border-t border-alabaster-grey-200 bg-alabaster-grey-50 flex items-center justify-between text-xs text-alabaster-grey-400">
              <span>
                Showing {data.leads.length} of {data.total} leads
              </span>
              <div className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                SDR_AUTO_SEND: {process.env.NEXT_PUBLIC_SDR_AUTO_SEND ?? "false (draft mode)"}
              </div>
            </div>
          </div>
        ) : (
          !loading && (
            <div className="bg-white rounded-xl border border-alabaster-grey-200 p-12 text-center">
              <Users className="h-10 w-10 text-alabaster-grey-300 mx-auto mb-3" />
              <p className="font-semibold text-alabaster-grey-700">No leads yet</p>
              <p className="text-sm text-alabaster-grey-400 mt-1">
                Leads appear here when someone unlocks a report with their email.
              </p>
            </div>
          )
        )}
      </div>

      {/* Email preview modal */}
      {selectedLead && (
        <EmailPreviewModal
          lead={selectedLead}
          secret={secret}
          onClose={() => setSelectedLead(null)}
          onSent={handleSent}
        />
      )}
    </div>
  );
}

export default function AdminLeadsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-steel-blue-400 border-t-transparent animate-spin" />
        </div>
      }
    >
      <AdminLeadsContent />
    </Suspense>
  );
}
