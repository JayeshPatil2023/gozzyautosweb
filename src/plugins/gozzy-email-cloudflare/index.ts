import { definePlugin } from "emdash";
import { cloudflareHooks } from "../../lib/email";

/**
 * Gozzy Autos Cloudflare Email Service Provider Plugin for EmDash CMS.
 *
 * Registers the `email:deliver` hook to handle system emails (invites, magic links, admin alerts)
 * using Cloudflare Workers `send_email` EMAIL binding in production.
 */
export function createPlugin() {
	return definePlugin({
		id: "gozzy-email-cloudflare",
		version: "1.0.0",
		capabilities: ["hooks.email-transport:register"],
		allowedHosts: ["*"],
		hooks: cloudflareHooks,
	});
}

export default createPlugin;
