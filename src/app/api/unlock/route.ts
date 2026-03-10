import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, analysisId } = body;

    if (!email || !analysisId) {
      return NextResponse.json(
        { error: "Email and analysisId are required" },
        { status: 400 }
      );
    }

    // Validate email format
    if (!email.match(/^[^@]+@[^@]+\.[^@]+$/)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Check if analysis exists
    const analysis = await prisma.analysis.findUnique({
      where: { id: analysisId },
    });

    if (!analysis) {
      return NextResponse.json(
        { error: "Analysis not found" },
        { status: 404 }
      );
    }

    // Upsert lead (avoid duplicate emails per analysis)
    await prisma.lead.upsert({
      where: {
        // We'll use a workaround for upsert since we don't have a unique constraint
        id: `${analysisId}-${email}`.replace(/[^a-zA-Z0-9]/g, "").slice(0, 25),
      },
      create: {
        id: `${analysisId}-${email}`.replace(/[^a-zA-Z0-9]/g, "").slice(0, 25),
        email,
        analysisId,
        company: analysis.companyName,
      },
      update: {},
    });

    // Mark analysis as unlocked
    await prisma.analysis.update({
      where: { id: analysisId },
      data: { unlocked: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unlock error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
