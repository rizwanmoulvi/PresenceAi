import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { runRealAnalysis } from "@/lib/llm";
import { simulateAnalysis } from "@/lib/simulate";

// 60 s max — requires Vercel Pro. On free tier the function will time out
// after 10 s and fall back to simulate via the error handler below.
export const maxDuration = 60;

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    // Fetch the pending analysis record
    const analysis = await prisma.analysis.findUnique({ where: { id } });
    if (!analysis) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
    }

    // Already completed (e.g. double-trigger) — nothing to do
    if (analysis.status === "complete") {
      return NextResponse.json({ ok: true, cached: true });
    }

    // Run real multi-model LLM analysis; fall back to simulate on any failure
    let result;
    try {
      result = await runRealAnalysis(
        analysis.companyName,
        analysis.industry,
        analysis.geography,
        analysis.products
      );
    } catch (llmErr) {
      console.warn("LLM analysis failed, using simulate fallback:", llmErr);
      result = simulateAnalysis(
        analysis.companyName,
        analysis.industry,
        analysis.geography,
        analysis.products
      );
    }

    // Persist results and mark complete
    await prisma.analysis.update({
      where: { id },
      data: {
        overallScore:    result.overallScore,
        modelScores:     JSON.stringify(result.modelScores),
        insights:        JSON.stringify(result.insights),
        recommendations: JSON.stringify(result.recommendations),
        status: "complete",
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Run route error:", error);

    // Mark errored so the client can stop polling
    await prisma.analysis
      .update({ where: { id }, data: { status: "error" } })
      .catch(() => {});

    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
