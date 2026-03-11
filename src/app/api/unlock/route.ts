import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateSDREmail } from "@/lib/sdr";
import { sendEmail } from "@/lib/email";
import type { ModelScore, Recommendation } from "@/lib/simulate";

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

    if (!email.match(/^[^@]+@[^@]+\.[^@]+$/)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const analysis = await prisma.analysis.findUnique({
      where: { id: analysisId },
    });

    if (!analysis) {
      return NextResponse.json(
        { error: "Analysis not found" },
        { status: 404 }
      );
    }

    // Parse report data
    const modelScores: ModelScore[] = JSON.parse(analysis.modelScores || "[]");
    const recommendations: Recommendation[] = JSON.parse(
      analysis.recommendations || "[]"
    );
    const topRec = recommendations[0];

    // Upsert lead with full profile data
    const leadId = `${analysisId}-${email}`
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 25);

    const lead = await prisma.lead.upsert({
      where: { id: leadId },
      create: {
        id: leadId,
        email,
        analysisId,
        company: analysis.companyName,
        industry: analysis.industry,
        geography: analysis.geography,
        products: analysis.products,
        score: analysis.overallScore,
        topRec: topRec?.title ?? null,
      },
      update: {
        industry: analysis.industry,
        geography: analysis.geography,
        products: analysis.products,
        score: analysis.overallScore,
        topRec: topRec?.title ?? null,
      },
    });

    // Mark analysis as unlocked
    await prisma.analysis.update({
      where: { id: analysisId },
      data: { unlocked: true },
    });

    // ── Fire-and-forget SDR pipeline ─────────────────────────────────────────
    generateAndSendSDR({
      leadId: lead.id,
      email,
      companyName: analysis.companyName,
      industry: analysis.industry,
      geography: analysis.geography,
      products: analysis.products,
      overallScore: analysis.overallScore,
      modelScores,
      recommendations,
    }).catch((err) => console.error("[SDR] pipeline error:", err));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unlock error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ── SDR pipeline (runs non-blocking after unlock response is returned) ─────────

async function generateAndSendSDR(opts: {
  leadId: string;
  email: string;
  companyName: string;
  industry: string;
  geography: string;
  products: string;
  overallScore: number;
  modelScores: ModelScore[];
  recommendations: Recommendation[];
}) {
  try {
    const emailContent = await generateSDREmail({
      email: opts.email,
      companyName: opts.companyName,
      industry: opts.industry,
      geography: opts.geography,
      products: opts.products,
      overallScore: opts.overallScore,
      modelScores: opts.modelScores,
      recommendations: opts.recommendations,
    });

    const autoSend = process.env.SDR_AUTO_SEND === "true";

    if (autoSend) {
      const result = await sendEmail({
        to: opts.email,
        subject: emailContent.subject,
        bodyText: emailContent.bodyText,
        bodyHtml: emailContent.bodyHtml,
      });

      await prisma.lead.update({
        where: { id: opts.leadId },
        data: {
          emailSubject: emailContent.subject,
          emailBodyText: emailContent.bodyText,
          emailBodyHtml: emailContent.bodyHtml,
          emailStatus: result.success ? "sent" : "pending",
          emailSentAt: result.success ? new Date() : null,
        },
      });
    } else {
      // Save draft — admin reviews before sending
      await prisma.lead.update({
        where: { id: opts.leadId },
        data: {
          emailSubject: emailContent.subject,
          emailBodyText: emailContent.bodyText,
          emailBodyHtml: emailContent.bodyHtml,
          emailStatus: "pending",
        },
      });
    }
  } catch (err) {
    console.error("[SDR] generateAndSendSDR failed:", err);
  }
}
