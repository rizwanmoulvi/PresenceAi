import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";

// ── auth helper ───────────────────────────────────────────────────────────────

function isAuthorized(request: Request): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  const header = request.headers.get("x-admin-secret");
  const url = new URL(request.url);
  const query = url.searchParams.get("secret");
  return header === secret || query === secret;
}

// ── GET /api/admin/leads/[id] ─────────────────────────────────────────────────

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lead = await prisma.lead.findUnique({
    where: { id: params.id },
    include: {
      analysis: true,
    },
  });

  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  return NextResponse.json(lead);
}

// ── PATCH /api/admin/leads/[id] ───────────────────────────────────────────────
// Allows: updating notes, status, or triggering a manual send

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json() as {
    notes?: string;
    emailStatus?: string;
    sendNow?: boolean;
  };

  const lead = await prisma.lead.findUnique({ where: { id: params.id } });
  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  // ── Manual send ────────────────────────────────────────────────────────────
  if (body.sendNow) {
    if (!lead.emailSubject || !lead.emailBodyText || !lead.emailBodyHtml) {
      return NextResponse.json(
        { error: "No email draft to send. Generate one first." },
        { status: 400 }
      );
    }
    if (lead.emailStatus === "sent") {
      return NextResponse.json(
        { error: "Email already sent to this lead." },
        { status: 409 }
      );
    }

    const result = await sendEmail({
      to: lead.email,
      subject: lead.emailSubject,
      bodyText: lead.emailBodyText,
      bodyHtml: lead.emailBodyHtml,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: `Send failed: ${result.error}` },
        { status: 502 }
      );
    }

    const updated = await prisma.lead.update({
      where: { id: params.id },
      data: { emailStatus: "sent", emailSentAt: new Date() },
    });

    return NextResponse.json({ success: true, lead: updated });
  }

  // ── Status / notes update ──────────────────────────────────────────────────
  const updateData: Record<string, unknown> = {};
  if (body.notes !== undefined) updateData.notes = body.notes;
  if (body.emailStatus !== undefined) updateData.emailStatus = body.emailStatus;

  const updated = await prisma.lead.update({
    where: { id: params.id },
    data: updateData,
  });

  return NextResponse.json({ success: true, lead: updated });
}
