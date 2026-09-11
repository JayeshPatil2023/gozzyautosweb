import { getEmDashCollection, getMenu } from "emdash";

export interface MenuItem {
	label: string;
	url: string;
	target?: string;
}

export interface ResolvedMenu {
	items: MenuItem[];
}

/**
 * Resolves the primary navigation menu.
 * Respects explicit EmDash Primary Menu items and published CMS pages with `show_in_nav`.
 */
export async function getResolvedPrimaryMenu(): Promise<ResolvedMenu> {
	const primaryMenu = await getMenu("primary");
	let menuItems: MenuItem[] = primaryMenu?.items ? [...primaryMenu.items] : [];

	const hiddenUrls = new Set<string>();
	const dynamicMenuItems: MenuItem[] = [];

	// Fetch dynamic pages created in EmDash CMS
	try {
		const { entries } = await getEmDashCollection("pages" as any);
		if (entries && entries.length > 0) {
			for (const page of entries) {
				const data = (page.data || {}) as Record<string, any>;
				const slug = page.slug || data.slug;
				const title = data.title || page.title;

				// Check show_in_nav from page top-level or page.data
				const rawShowInNav = (page as any).show_in_nav ?? data.show_in_nav;
				const isExplicitlyHidden = rawShowInNav === false || rawShowInNav === 0 || rawShowInNav === "false";
				const isExplicitlyShown = rawShowInNav === true || rawShowInNav === 1 || rawShowInNav === "true";

				if (slug) {
					const pageUrl = `/${slug.replace(/^\//, "")}`;
					if (isExplicitlyHidden) {
						hiddenUrls.add(pageUrl);
					} else if (isExplicitlyShown && title) {
						dynamicMenuItems.push({
							label: String(title),
							url: pageUrl,
						});
					}
				}
			}
		}
	} catch (e) {
		// Ignore error if pages collection doesn't exist yet
	}

	// 1. Remove any URLs that have show_in_nav = false
	menuItems = menuItems.filter((item) => !hiddenUrls.has(item.url));

	// 2. Add dynamic pages that have show_in_nav = true and aren't already in menuItems
	for (const dynItem of dynamicMenuItems) {
		if (!menuItems.some((item) => item.url === dynItem.url)) {
			menuItems.push(dynItem);
		}
	}

	// Default fallback if no menu items exist
	if (menuItems.length === 0) {
		menuItems = [
			{ label: "Home", url: "/" },
			{ label: "Vehicles", url: "/vehicles" },
		];
	}

	return { items: menuItems };
}
