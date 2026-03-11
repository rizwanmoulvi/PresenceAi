import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// ── auth helper ───────────────────────────────────────────────────────────────

function isAuthorized(request: Request): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  const header = request.headers.get("x-admin-secret");
  const url = new URL(request.url);
  const query = url.searchParams.get("secret");
  return header === secret || query === secret;
}

// ── GET /api/admin/leads ──────────────────────────────────────────────────────

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status"); // pending | sent | replied | archived
  const search = url.searchParams.get("search")?.toLowerCase();
  const page = parseInt(url.searchParams.get("page") ?? "1");
  const perPage = 50;

  const where: Record<string, unknown> = {};
  if (status) where.emailStatus = status;

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        analysis: {
          select: {
            overallScore: true,
            industry: true,
            geography: true,
            products: true,
            modelScores: true,
            createdAt: true,
          },
        },
      },
    }),
    prisma.lead.count({ where }),
  ]);

  // Apply client-side search filter (SQLite has limited LIKE support)
  const filtered = search
    ? leads.filter(
        (l) =>
          l.company?.toLowerCase().includes(search) ||
          l.email.toLowerCase().includes(search) ||
          l.industry?.toLowerCase().includes(search)
      )
    : leads;

  // Aggregate stats
  const stats = await prisma.lead.groupBy({
    by: ["emailStatus"],
    _count: { _all: true },
  });

  const statusMap = Object.fromEntries(
    stats.map((s) => [s.emailStatus, s._count._all])
  );

  const allLeads = await prisma.lead.findMany({
    select: { score: true },
  });
  const avgScore =
    allLeads.length > 0
      ? Math.round(
          allLeads.reduce((s, l) => s + (l.score ?? 0), 0) / allLeads.length
        )
      : 0;

  return NextResponse.json({
    leads: filtered,
    total,
    page,
    perPage,
    stats: {
      total: await prisma.lead.count(),
      pending: statusMap["pending"] ?? 0,
      sent: statusMap["sent"] ?? 0,
      replied: statusMap["replied"] ?? 0,
      archived: statusMap["archived"] ?? 0,
      avgScore,
    },
  });
}
