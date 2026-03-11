/**
 * Email sending wrapper using Resend
 * https://resend.com/docs
 *
 * Falls back to a console log when RESEND_API_KEY is not configured so the
 * dev experience stays smooth without any setup.
 */

export interface SendEmailOptions {
  to: string;
  subject: string;
  bodyText: string;
  bodyHtml: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendEmail(
  opts: SendEmailOptions
): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = `${process.env.SDR_FROM_NAME ?? "PresenceAI"} <${process.env.SDR_FROM_EMAIL ?? "sdr@presenceai.com"}>`;

  // ── dev fallback (no Resend key configured) ──────────────────────────────
  const isConfigured = apiKey && !apiKey.startsWith("re_your");

  if (!isConfigured) {
    console.log("\n[EMAIL MOCK] ─────────────────────────────────────────");
    console.log(`  To:      ${opts.to}`);
    console.log(`  From:    ${from}`);
    console.log(`  Subject: ${opts.subject}`);
    console.log("  Body:\n" + opts.bodyText.slice(0, 300) + "...");
    console.log("──────────────────────────────────────────────────────\n");
    return { success: true, messageId: `mock_${Date.now()}` };
  }

  // ── Resend API ────────────────────────────────────────────────────────────
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [opts.to],
        subject: opts.subject,
        text: opts.bodyText,
        html: opts.bodyHtml,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[EMAIL] Resend error:", err);
      return { success: false, error: err };
    }

    const data = (await res.json()) as { id: string };
    return { success: true, messageId: data.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[EMAIL] Send failed:", msg);
    return { success: false, error: msg };
  }
}
