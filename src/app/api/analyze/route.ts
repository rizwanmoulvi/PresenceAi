import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { runRealAnalysis } from "@/lib/llm";
import { simulateAnalysis } from "@/lib/simulate";

// Allow up to 60 s for real LLM calls (Vercel Pro / custom servers)
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { companyName, industry, geography, products } = body;

    if (!companyName || !industry || !geography || !products) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // 1 ─ Create the record immediately
    const analysis = await prisma.analysis.create({
      data: {
        companyName,
        industry,
        geography,
        products,
        status: "analyzing",
        modelScores: "[]",
        insights: "[]",
        recommendations: "[]",
      },
    });

    // 2 ─ Run real multi-model LLM analysis; fall back to simulate on failure
    let result;
    try {
      result = await runRealAnalysis(companyName, industry, geography, products);
    } catch (llmErr) {
      console.warn("LLM analysis failed, using simulate fallback:", llmErr);
      result = simulateAnalysis(companyName, industry, geography, products);
    }

    // 3 ─ Persist results and mark complete
    await prisma.analysis.update({
      where: { id: analysis.id },
      data: {
        overallScore:    result.overallScore,
        modelScores:     JSON.stringify(result.modelScores),
        insights:        JSON.stringify(result.insights),
        recommendations: JSON.stringify(result.recommendations),
        status: "complete",
      },
    });

    return NextResponse.json({ id: analysis.id });
  } catch (error) {
    console.error("Analyze route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
