import { getEmDashCollection, getSiteSetting } from "emdash";

export interface CustomScripts {
	headerScript: string;
	footerScript: string;
}

/**
 * Fetch custom header & footer scripts from EmDash CMS.
 * Checks the `custom_scripts` collection first, then falls back to site settings options.
 */
export async function getCustomScripts(): Promise<CustomScripts> {
	let headerScript = "";
	let footerScript = "";

	// 1. Try to fetch from `custom_scripts` collection
	try {
		const { entries } = await getEmDashCollection("custom_scripts" as any);
		if (entries && entries.length > 0) {
			const data = (entries[0].data || {}) as Record<string, any>;
			if (data.header_script) headerScript = String(data.header_script);
			if (data.footer_script) footerScript = String(data.footer_script);
		}
	} catch (e) {
		// Collection might not exist yet or empty
	}

	// 2. Fallback to site settings options if collection didn't yield values
	if (!headerScript) {
		try {
			const settingHeader = await getSiteSetting("header_script" as any);
			if (settingHeader && typeof settingHeader === "string") {
				headerScript = settingHeader;
			}
		} catch (e) {}
	}

	if (!footerScript) {
		try {
			const settingFooter = await getSiteSetting("footer_script" as any);
			if (settingFooter && typeof settingFooter === "string") {
				footerScript = settingFooter;
			}
		} catch (e) {}
	}

	return {
		headerScript: headerScript.trim(),
		footerScript: footerScript.trim(),
	};
}
