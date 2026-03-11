import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/my-reports?email=user@example.com
// Returns all analyses that the given email has unlocked.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const email = url.searchParams.get("email")?.toLowerCase().trim();

  if (!email || !email.match(/^[^@]+@[^@]+\.[^@]+$/)) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  // Find all leads belonging to this email, including their analysis
  const leads = await prisma.lead.findMany({
    where: { email: { equals: email, mode: "insensitive" } },
    orderBy: { createdAt: "desc" },
    include: {
      analysis: {
        select: {
          id: true,
          companyName: true,
          industry: true,
          geography: true,
          overallScore: true,
          status: true,
          createdAt: true,
        },
      },
    },
  });

  const reports = leads.map((lead) => ({
    analysisId: lead.analysisId,
    company: lead.company ?? lead.analysis?.companyName ?? "—",
    industry: lead.industry ?? lead.analysis?.industry ?? "—",
    geography: lead.geography ?? lead.analysis?.geography ?? "—",
    score: lead.score ?? lead.analysis?.overallScore ?? 0,
    status: lead.analysis?.status ?? "unknown",
    createdAt: lead.createdAt,
  }));

  return NextResponse.json({ reports });
}
