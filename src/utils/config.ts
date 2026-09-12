import { getEmDashEntry, getEmDashCollection } from "emdash";

export interface SiteConfigurationData {
	title?: string;
	email_from?: string;
	email_from_name?: string;
	admin_email?: string;
	staff_email?: string;
	mailgun_domain?: string;
	email_provider?: "auto" | "cloudflare" | "mailgun" | "smtp";
	recaptcha_site_key?: string;
	recaptcha_secret_key?: string;
}

/**
 * Fetch Global Site Configuration settings from EmDash CMS collection `site_configurations`.
 */
export async function getSiteConfiguration(): Promise<SiteConfigurationData | null> {
	try {
		const { entry } = await getEmDashEntry("site_configurations" as any, "main");
		if (entry?.data) {
			return entry.data as SiteConfigurationData;
		}
		const { entries } = await getEmDashCollection("site_configurations" as any);
		if (entries && entries.length > 0) {
			return entries[0].data as SiteConfigurationData;
		}
	} catch (err) {
		console.warn("[SiteConfig] Unable to fetch Site Configuration from EmDash:", err);
	}
	return null;
}
