import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const analysis = await prisma.analysis.findUnique({
      where: { id },
    });

    if (!analysis) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: analysis.id,
      companyName: analysis.companyName,
      industry: analysis.industry,
      geography: analysis.geography,
      products: analysis.products,
      overallScore: analysis.overallScore,
      modelScores: JSON.parse(analysis.modelScores),
      insights: JSON.parse(analysis.insights),
      recommendations: JSON.parse(analysis.recommendations),
      status: analysis.status,
      unlocked: analysis.unlocked,
      createdAt: analysis.createdAt,
    });
  } catch (error) {
    console.error("Report fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
