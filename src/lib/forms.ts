/**
 * Form Helper Utilities for Gozzy Autos Contact Submissions.
 */
import { sendEmail, type EmailMessage } from "./email";

export interface ContactFormInput {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	comments: string;
}

export function json(data: unknown, status = 200): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			"Content-Type": "application/json",
			"Cache-Control": "no-store",
		},
	});
}

export async function readBody<T = Record<string, unknown>>(request: Request): Promise<T> {
	try {
		return (await request.json()) as T;
	} catch {
		return {} as T;
	}
}

export const str = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

export const esc = (s: string): string =>
	s
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");

/** Format Reply-To header cleanly as `"Name" <email>` */
export function formatReplyToAddress(name: string, email: string): string {
	const addr = email.trim();
	if (!addr) return "";
	const safeName = name.replace(/[\r\n"]/g, "").trim();
	if (safeName && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr)) {
		return `"${safeName}" <${addr}>`;
	}
	return addr;
}

/** Formats plain text email notification for admin */
export function formatContactEmailText(data: ContactFormInput): string {
	return `
New Contact Us Form Submission — Gozzy Autos

First Name: ${data.firstName}
Last Name:  ${data.lastName}
Email:      ${data.email}
Phone:      ${data.phone}

Comments / Message:
--------------------------------------------------
${data.comments}
--------------------------------------------------

Sent automatically from the Gozzy Autos Website Contact Form.
`.trim();
}

/** Formats HTML email notification for admin */
export function formatContactEmailHtml(data: ContactFormInput): string {
	const fullName = `${esc(data.firstName)} ${esc(data.lastName)}`.trim();

	return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Public Sans', Arial, sans-serif; background-color: #f8f9fa; color: #212529; padding: 20px; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e9ecef; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { background: #4680ff; color: #ffffff; padding: 24px; text-align: center; }
    .header h2 { margin: 0; font-size: 22px; font-weight: 700; }
    .body { padding: 24px; }
    .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .table td { padding: 10px 12px; border-bottom: 1px solid #f1f3f5; font-size: 14px; }
    .table td.label { font-weight: 600; color: #495057; width: 30%; background: #f8f9fa; }
    .comments-box { background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 16px; font-size: 14px; line-height: 1.6; white-space: pre-wrap; }
    .footer { font-size: 12px; color: #6c757d; text-align: center; padding: 16px; border-top: 1px solid #f1f3f5; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h2>🚗 New Contact Form Submission</h2>
    </div>
    <div class="body">
      <table class="table">
        <tr>
          <td class="label">Full Name</td>
          <td>${fullName}</td>
        </tr>
        <tr>
          <td class="label">Email Address</td>
          <td><a href="mailto:${esc(data.email)}">${esc(data.email)}</a></td>
        </tr>
        <tr>
          <td class="label">Phone Number</td>
          <td><a href="tel:${esc(data.phone)}">${esc(data.phone)}</a></td>
        </tr>
      </table>

      <h4 style="margin-bottom: 8px; color: #212529;">Message / Comments:</h4>
      <div class="comments-box">${esc(data.comments)}</div>
    </div>
    <div class="footer">
      Sent from Gozzy Autos Contact Form • Reply directly to this email to contact ${fullName}.
    </div>
  </div>
</body>
</html>
`.trim();
}

/** Error boundary helper for API routes */
export async function withErrors(fn: () => Promise<Response>): Promise<Response> {
	try {
		return await fn();
	} catch (err) {
		console.error("[forms-error]", err);
		return json(
			{
				success: false,
				message: "An unexpected error occurred while processing your request. Please try again.",
			},
			500,
		);
	}
}

export { sendEmail };
