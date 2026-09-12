/**
 * Email Infrastructure System for Gozzy Autos.
 *
 * Environment Transports:
 * 1. Production (Cloudflare Workers Runtime):
 *    - Cloudflare Email Service using Worker binding: env.EMAIL.send()
 *    - Mailgun HTTP REST API via fetch (optional fallback if MAILGUN_API_KEY is set)
 *
 * 2. Local Development (Node.js Runtime / `astro dev`):
 *    - SMTP via nodemailer (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS from .env)
 *    - Dev Capture fallback (logs email payload to console when SMTP is unconfigured)
 */

export interface EmailMessage {
	to?: string;
	subject: string;
	text: string;
	html?: string;
	replyTo?: string;
	fromDisplayName?: string;
	provider?: "auto" | "smtp" | "cloudflare" | "mailgun";
}

export interface StoredEmail {
	message: Record<string, unknown>;
	source: string;
	sentAt: string;
}

type EnvMap = Record<string, string | undefined>;

const GLOBAL_KEY = Symbol.for("gozzy:dev-emails");
const g = globalThis as Record<symbol, unknown>;
const storedEmails: StoredEmail[] = (() => {
	const existing = g[GLOBAL_KEY] as StoredEmail[] | undefined;
	if (existing) return existing;
	return (g[GLOBAL_KEY] = [] as StoredEmail[]);
})();

let cfEnvCache: EnvMap | null | undefined;
let cfBindingCache: Record<string, unknown> | null | undefined;

const ENV_KEYS = [
	"SMTP_HOST",
	"SMTP_PORT",
	"SMTP_USER",
	"SMTP_PASS",
	"SMTP_SECURE",
	"GOZZY_EMAIL_FROM",
	"GOZZY_EMAIL_FROM_NAME",
	"GOZZY_ADMIN_EMAIL",
	"GOZZY_STAFF_EMAIL",
	"MAILGUN_API_KEY",
	"MAILGUN_DOMAIN",
	"EMAIL_PROVIDER",
] as const;

export function getDevEmails(): StoredEmail[] {
	return [...storedEmails].reverse();
}

/** Check if current execution environment is Cloudflare Workers */
export function isWorkersRuntime(): boolean {
	try {
		const ua = globalThis.navigator?.userAgent;
		if (typeof ua === "string" && ua.includes("Cloudflare-Workers")) return true;
	} catch {
		/* ignore */
	}
	return !(typeof process !== "undefined" && Boolean(process.versions?.node));
}

async function loadCloudflareEnv(): Promise<EnvMap> {
	if (cfEnvCache !== undefined) return cfEnvCache ?? {};
	try {
		const mod = await import("cloudflare:workers");
		cfEnvCache = (mod as unknown as { env?: EnvMap }).env ?? {};
		return cfEnvCache;
	} catch {
		cfEnvCache = null;
		return {};
	}
}

async function loadCloudflareBindings(): Promise<Record<string, unknown>> {
	if (cfBindingCache !== undefined) return cfBindingCache ?? {};
	try {
		const mod = await import("cloudflare:workers");
		cfBindingCache = (mod as unknown as { env?: Record<string, unknown> }).env ?? {};
		return cfBindingCache;
	} catch {
		cfBindingCache = null;
		return {};
	}
}

async function resolveCloudflareEmailBinding(): Promise<unknown | undefined> {
	const bindings = await loadCloudflareBindings();
	return bindings.EMAIL ?? bindings.SEND_EMAIL;
}

/** Resolve environment variables across Vite, Node process.env, and Cloudflare Worker bindings */
export async function getEnv(): Promise<EnvMap> {
	const out: EnvMap = {};
	try {
		const meta = import.meta.env as unknown as EnvMap;
		for (const k of ENV_KEYS) {
			if (meta[k]) out[k] = meta[k];
		}
	} catch {
		/* ignore */
	}
	if (typeof process !== "undefined" && process.env) {
		for (const k of ENV_KEYS) {
			if (!out[k] && process.env[k]) out[k] = process.env[k];
		}
	}
	const cf = await loadCloudflareEnv();
	for (const k of ENV_KEYS) {
		const v = cf[k];
		if (!out[k] && typeof v === "string" && v.length > 0) out[k] = v;
	}
	return out;
}

function isSmtpConfigured(env: EnvMap): boolean {
	const host = env.SMTP_HOST;
	const user = env.SMTP_USER;
	const pass = env.SMTP_PASS;
	return Boolean(host && user && pass);
}

function captureDev(msg: EmailMessage, from: string | undefined, to: string | undefined, reason: string): void {
	storedEmails.push({ message: { ...msg, from }, source: "contact-form", sentAt: new Date().toISOString() });
	while (storedEmails.length > 100) storedEmails.shift();
	console.log(`\n📧 [Gozzy-Email-Dev] Captured Email (${reason})\n   From: ${from}\n   To: ${to}\n   Subject: ${msg.subject}\n   Text:\n${msg.text}\n`);
}

/** Send email via Node.js SMTP transport (using nodemailer dynamic import) */
async function sendViaSmtp(env: EnvMap, fromHeader: string, msg: EmailMessage, to: string): Promise<void> {
	const nodemailer = await import("nodemailer");
	const host = env.SMTP_HOST;
	const port = Number(env.SMTP_PORT || "587");
	const user = env.SMTP_USER;
	const pass = env.SMTP_PASS;
	const isSecure = env.SMTP_SECURE === "true" || port === 465;

	const transporter = nodemailer.createTransport({
		host,
		port,
		secure: isSecure,
		auth: { user, pass },
	});

	await transporter.sendMail({
		from: fromHeader,
		to,
		subject: msg.subject,
		text: msg.text,
		html: msg.html,
		replyTo: msg.replyTo,
	});

	console.log("[Gozzy-Email] Sent email via local Node SMTP", { to, subject: msg.subject });
}

interface CloudflareEmailBinding {
	send(message: {
		to: string;
		from: string | { email: string; name?: string };
		subject: string;
		html?: string;
		text?: string;
		replyTo?: string;
	}): Promise<{ messageId?: string }>;
}

/** Send email via Cloudflare Email Service EMAIL binding on Workers */
async function sendViaCloudflareEmail(
	fromAddr: string,
	displayName: string | undefined,
	msg: EmailMessage,
	to: string,
): Promise<void> {
	const binding = await resolveCloudflareEmailBinding();
	const email = binding as CloudflareEmailBinding | undefined;
	if (!email || typeof email.send !== "function") {
		throw new Error(
			"[Gozzy-Email-Cloudflare] Cloudflare EMAIL binding is not configured. " +
			"Ensure wrangler.jsonc contains send_email binding.",
		);
	}

	try {
		const result = await email.send({
			to,
			from: displayName ? { email: fromAddr, name: displayName } : fromAddr,
			subject: msg.subject,
			text: msg.text,
			html: msg.html,
			replyTo: msg.replyTo,
		});

		console.log("[Gozzy-Email-Cloudflare] Sent via Cloudflare Email Service", {
			to,
			subject: msg.subject,
			messageId: result?.messageId,
		});
	} catch (err) {
		console.error("[Gozzy-Email-Cloudflare] Email send failed", err);
		throw err;
	}
}

/** Main email sending dispatcher */
export async function sendEmail(msg: EmailMessage): Promise<void> {
	const env = await getEnv();
	const fromAddr = env.GOZZY_EMAIL_FROM || "info@gozzyautos.com";
	const defaultFromName = env.GOZZY_EMAIL_FROM_NAME?.trim() || "Gozzy Autos";
	const displayName = msg.fromDisplayName?.trim() || defaultFromName;
	const fromHeader = displayName ? `"${displayName}" <${fromAddr}>` : fromAddr;
	const to = msg.to || env.GOZZY_ADMIN_EMAIL || env.GOZZY_STAFF_EMAIL || "info@gozzyautos.com";

	const workers = isWorkersRuntime();
	const requested = msg.provider || env.EMAIL_PROVIDER?.trim() || "auto";

	// 1. Production Workers Runtime
	if (workers) {
		const cfBinding = await resolveCloudflareEmailBinding();
		if (cfBinding || requested === "cloudflare") {
			await sendViaCloudflareEmail(fromAddr, displayName, msg, to);
			return;
		}
		throw new Error("[Gozzy-Email] Cloudflare Email binding is required on Workers runtime.");
	}

	// 2. Local Node Runtime (astro dev)
	if (isSmtpConfigured(env) || requested === "smtp") {
		await sendViaSmtp(env, fromHeader, msg, to);
		return;
	}

	// 3. Fallback: Dev Capture
	captureDev(msg, fromHeader, to, "Local dev (SMTP credentials not configured in .env)");
}

/** Exclusive email:deliver hook for EmDash admin system mail (invites, magic links, admin notifications) */
export const cloudflareHooks = {
	"email:deliver": {
		exclusive: true,
		handler: async (event: {
			message: { to: unknown; subject: unknown; text: unknown; html?: unknown };
		}) => {
			console.log("[Gozzy-Email-Cloudflare] EmDash email:deliver hook triggered", {
				to: String(event.message.to),
				subject: String(event.message.subject),
				runtime: isWorkersRuntime() ? "workers" : "node",
			});
			await sendEmail({
				provider: "cloudflare",
				to: String(event.message.to),
				subject: String(event.message.subject),
				text: String(event.message.text),
				html: typeof event.message.html === "string" ? event.message.html : undefined,
			});
		},
	},
};
