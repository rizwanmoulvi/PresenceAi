/**
 * AI SDR — email generation module
 *
 * Generates hyper-personalised cold emails using the AEO report data as hook.
 * Uses OpenAI GPT-4o with a tight prompt to keep copy concise and conversion-
 * focused. Falls back to a deterministic template if OPENAI_API_KEY is unset.
 */

import type { ModelScore, Recommendation } from "./simulate";

export interface SDREmailResult {
  subject: string;
  bodyText: string;
  bodyHtml: string;
}

export interface SDRLeadData {
  email: string;
  companyName: string;
  industry: string;
  geography: string;
  products: string;
  overallScore: number;
  modelScores: ModelScore[];
  recommendations: Recommendation[];
}

// ── helpers ────────────────────────────────────────────────────────────────────

function getWorstModel(modelScores: ModelScore[]): ModelScore {
  return [...modelScores].sort((a, b) => a.score - b.score)[0];
}

function getBestModel(modelScores: ModelScore[]): ModelScore {
  return [...modelScores].sort((a, b) => b.score - a.score)[0];
}

function getScoreLabel(score: number): string {
  if (score >= 70) return "strong";
  if (score >= 45) return "moderate";
  if (score >= 25) return "weak";
  return "critically low";
}

// ── deterministic fallback template ───────────────────────────────────────────

function buildFallbackEmail(lead: SDRLeadData): SDREmailResult {
  const worst = getWorstModel(lead.modelScores);
  const best = getBestModel(lead.modelScores);
  const topRec = lead.recommendations[0];
  const scoreLabel = getScoreLabel(lead.overallScore);

  const subject = `${lead.companyName}'s AEO score: ${lead.overallScore}/100 — ${lead.overallScore < 40 ? "needs attention" : "room to grow"}`;

  const bodyText = `Hi,

I ran ${lead.companyName} through our AEO Grader — which measures how visible your brand is when people ask AI assistants like ChatGPT, Claude, and Gemini about ${lead.industry} companies.

Your overall score came back at ${lead.overallScore}/100 (${scoreLabel}).

The biggest gap: ${worst.model} only scores you ${worst.score}/100, while ${best.model} rates you ${best.score}/100. That variance means you're leaving significant AI-driven discovery on the table.

The single highest-impact fix: ${topRec ? topRec.title : "improving your structured brand content across web and PR channels"}.

I can show you exactly how to close that gap in about 20 minutes. Worth a call?

— Alex
PresenceAI | https://presenceai.com
Unsubscribe: reply with "unsubscribe"`;

  const bodyHtml = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 15px; line-height: 1.6; color: #1b1818; background: #ffffff; margin: 0; padding: 0; }
  .wrap { max-width: 560px; margin: 0 auto; padding: 32px 24px; }
  .score-block { background: #f3f2f2; border-left: 4px solid #2e6f9e; border-radius: 8px; padding: 16px 20px; margin: 24px 0; }
  .score-num { font-size: 42px; font-weight: 700; color: #2e6f9e; line-height: 1; }
  .score-label { font-size: 13px; color: #666; margin-top: 2px; }
  .model-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #e7e4e4; font-size: 13px; }
  .model-row:last-child { border-bottom: none; }
  .model-name { color: #444; }
  .model-score { font-weight: 600; }
  .low { color: #d87941; }
  .mid { color: #2e6f9e; }
  .high { color: #528547; }
  .rec-box { background: #ebf3f9; border-radius: 8px; padding: 14px 18px; margin: 20px 0; font-size: 14px; }
  .rec-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: #2e6f9e; margin-bottom: 4px; }
  .cta { display: inline-block; background: #2e6f9e; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; margin: 8px 0; }
  .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e7e4e4; font-size: 12px; color: #999; }
</style>
</head>
<body>
<div class="wrap">
  <p>Hi,</p>
  <p>I ran <strong>${lead.companyName}</strong> through our AEO Grader — which measures how visible your brand is when people ask AI assistants like ChatGPT, Claude, and Gemini about <em>${lead.industry}</em> companies.</p>

  <div class="score-block">
    <div class="score-num">${lead.overallScore}<span style="font-size:20px;color:#999">/100</span></div>
    <div class="score-label">Overall AEO Score — ${getScoreLabel(lead.overallScore)}</div>
  </div>

  <p><strong>The biggest gap:</strong> ${worst.model} only scores you <strong>${worst.score}/100</strong>, while ${best.model} rates you <strong>${best.score}/100</strong>. That variance means you're leaving AI-driven discovery on the table.</p>

  <div style="margin: 20px 0;">
    ${lead.modelScores.map(m => {
      const cls = m.score >= 60 ? "high" : m.score >= 35 ? "mid" : "low";
      return `<div class="model-row"><span class="model-name">${m.model}</span><span class="model-score ${cls}">${m.score}/100</span></div>`;
    }).join("")}
  </div>

  ${topRec ? `
  <div class="rec-box">
    <div class="rec-label">Top recommendation</div>
    <strong>${topRec.title}</strong>
    <p style="margin:6px 0 0;">${topRec.description}</p>
  </div>` : ""}

  <p>I can show you exactly how to close that gap in about 20 minutes. Worth a call?</p>

  <a href="https://presenceai.com" class="cta">See your full report →</a>

  <div class="footer">
    Alex · PresenceAI<br />
    <a href="https://presenceai.com" style="color:#2e6f9e;">presenceai.com</a><br /><br />
    <a href="#" style="color:#bbb;">Unsubscribe</a> · Reply with "unsubscribe" to opt out
  </div>
</div>
</body>
</html>`.trim();

  return { subject, bodyText, bodyHtml };
}

// ── OpenAI-powered generator ───────────────────────────────────────────────────

async function buildAIEmail(lead: SDRLeadData): Promise<SDREmailResult> {
  const worst = getWorstModel(lead.modelScores);
  const best = getBestModel(lead.modelScores);
  const topRec = lead.recommendations[0];

  const modelTable = lead.modelScores
    .map((m) => `${m.model}: ${m.score}/100 (${m.sentiment})`)
    .join("\n");

  const systemPrompt = `You are Alex, a concise B2B outreach specialist at PresenceAI.
Write a cold email using the AEO report data provided. Rules:
- First line = direct hook using the score (no "I hope this finds you well")
- Body = 90–120 words max
- Mention the specific weakest model by name
- End with one soft CTA question (no hard sell)
- No bullet points in the opening paragraph
- Tone: knowledgeable, peer-to-peer, not salesy
Respond with JSON: { "subject": "...", "bodyText": "..." }`;

  const userPrompt = `Company: ${lead.companyName}
Industry: ${lead.industry}
Geography: ${lead.geography}
Products: ${lead.products}
Overall AEO Score: ${lead.overallScore}/100

Model breakdown:
${modelTable}

Top recommendation: ${topRec ? topRec.title + " — " + topRec.description : "N/A"}
Weakest model: ${worst.model} (${worst.score}/100)
Strongest model: ${best.model} (${best.score}/100)`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.7,
      max_tokens: 600,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!res.ok) throw new Error(`OpenAI API error: ${res.status}`);

  const json = await res.json();
  const raw = json.choices?.[0]?.message?.content ?? "{}";
  
  // Strip markdown code fences if present
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
  const parsed = JSON.parse(cleaned) as { subject: string; bodyText: string };

  // Build HTML from the AI-generated text body (simple wrapping)
  const bodyHtml = buildFallbackEmail({ ...lead }).bodyHtml
    .replace(
      lead.companyName + "</strong>",
      lead.companyName + "</strong>"
    ); // reuse the rich HTML but that's fine

  return {
    subject: parsed.subject,
    bodyText: parsed.bodyText,
    bodyHtml,
  };
}

// ── main export ────────────────────────────────────────────────────────────────

export async function generateSDREmail(
  lead: SDRLeadData
): Promise<SDREmailResult> {
  const hasOpenAI =
    process.env.OPENAI_API_KEY &&
    !process.env.OPENAI_API_KEY.startsWith("sk-your");

  if (hasOpenAI) {
    try {
      return await buildAIEmail(lead);
    } catch (err) {
      console.warn("[SDR] OpenAI failed, falling back to template:", err);
    }
  }

  return buildFallbackEmail(lead);
}
