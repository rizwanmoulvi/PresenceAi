import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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

    // Create the record immediately and return the ID.
    // The actual LLM analysis is triggered separately by the client
    // via POST /api/analyze/[id]/run — this keeps the initial request
    // well under Vercel's serverless timeout.
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

    return NextResponse.json({ id: analysis.id });
  } catch (error) {
    console.error("Analyze route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
