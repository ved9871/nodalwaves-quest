import type { Transporter } from "nodemailer";
import { ENV } from "./env";

/**
 * Email delivery for NodalQuest.
 *
 * Transport is chosen at runtime:
 *   - If SMTP_* env vars are configured  -> real SMTP send via nodemailer.
 *   - Otherwise (local/beta, no SMTP)    -> the message is logged to the server
 *     console and `delivered: false` is returned, so flows still work end-to-end
 *     without silently pretending mail was sent.
 *
 * nodemailer is imported dynamically so the server boots even if the package or
 * SMTP config is absent.
 */

export function isEmailConfigured(): boolean {
  return Boolean(ENV.smtpHost && ENV.smtpUser && ENV.smtpPass);
}

let _transporter: Transporter | null = null;

async function getTransporter(): Promise<Transporter | null> {
  if (!isEmailConfigured()) return null;
  if (_transporter) return _transporter;
  const nodemailer = await import("nodemailer");
  _transporter = nodemailer.createTransport({
    host: ENV.smtpHost,
    port: ENV.smtpPort,
    secure: ENV.smtpPort === 465, // implicit TLS on 465, STARTTLS otherwise
    auth: { user: ENV.smtpUser, pass: ENV.smtpPass },
  });
  return _transporter;
}

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export type SendEmailResult = { delivered: boolean; reason?: string };

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const from = `"${ENV.smtpFromName}" <${ENV.smtpFromEmail}>`;
  const text = input.text ?? stripHtml(input.html);
  try {
    const transporter = await getTransporter();
    if (!transporter) {
      console.warn(
        `[Email] SMTP not configured — not sending "${input.subject}" to ${input.to}.\n` +
        `[Email] (dev fallback) message body:\n${text}`
      );
      return { delivered: false, reason: "SMTP_NOT_CONFIGURED" };
    }
    await transporter.sendMail({ from, to: input.to, subject: input.subject, html: input.html, text });
    return { delivered: true };
  } catch (error) {
    console.error("[Email] Send failed:", error);
    return { delivered: false, reason: "SEND_FAILED" };
  }
}

/** Branded HTML wrapper for transactional emails. */
export function brandedEmail(opts: { heading: string; body: string; footnote?: string }): string {
  const footnote =
    opts.footnote ??
    "NodalQuest is an educational platform. XP, badges, and ranks are not financial instruments.";
  return `<!doctype html><html><body style="margin:0;background:#08080a;font-family:Arial,Helvetica,sans-serif;color:#e8e8ec">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#08080a;padding:32px 0">
    <tr><td align="center">
      <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background:#111114;border:1px solid #26262d;border-radius:14px;overflow:hidden">
        <tr><td style="padding:22px 28px;border-bottom:1px solid #26262d">
          <span style="font-weight:700;font-size:18px;color:#ffffff;letter-spacing:.02em">Nodal<span style="color:#ff3a55">Waves</span> <span style="color:#c6cdd6">Quest</span></span>
        </td></tr>
        <tr><td style="padding:28px">
          <h1 style="margin:0 0 14px;font-size:20px;color:#ffffff">${opts.heading}</h1>
          <div style="font-size:15px;line-height:1.6;color:#c4c4cc">${opts.body}</div>
        </td></tr>
        <tr><td style="padding:18px 28px;border-top:1px solid #26262d;font-size:12px;color:#7a7a84">${footnote}</td></tr>
      </table>
    </td></tr>
  </table></body></html>`;
}
