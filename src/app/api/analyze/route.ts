import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { simulateAnalysis } from "@/lib/simulate";

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

    // Create initial record with pending status
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

    // Simulate async analysis (in production this would be a background job)
    const result = simulateAnalysis(companyName, industry, geography, products);

    // Update with results
    await prisma.analysis.update({
      where: { id: analysis.id },
      data: {
        overallScore: result.overallScore,
        modelScores: JSON.stringify(result.modelScores),
        insights: JSON.stringify(result.insights),
        recommendations: JSON.stringify(result.recommendations),
        status: "complete",
      },
    });

    return NextResponse.json({ id: analysis.id });
  } catch (error) {
    console.error("Analyze error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
