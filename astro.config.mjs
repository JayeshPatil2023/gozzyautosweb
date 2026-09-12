import path from "node:path";
import { fileURLToPath } from "node:url";
import node from "@astrojs/node";
import react from "@astrojs/react";
import { defineConfig } from "astro/config";
import emdash, { local } from "emdash/astro";
import { sqlite } from "emdash/db";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─────────────────────────────────────────────────────────────────────────────
// Gozzy Autos Web — Local Development Configuration
//
// Database : SQLite  → stored in ./data.db (auto-created on first run)
// Storage  : Local   → uploaded media saved in ./uploads/
// Adapter  : Node.js → runs locally with `npm run dev`
//
// For future Cloudflare deployment: see wrangler.jsonc and replace the
// database/storage/adapter values with the Cloudflare equivalents.
// ─────────────────────────────────────────────────────────────────────────────

export default defineConfig({
	output: "server",
	adapter: node({ mode: "standalone" }),
	image: {
		layout: "constrained",
		responsiveStyles: true,
	},
	integrations: [
		react(),
		emdash({
			// SQLite database — creates ./data.db automatically on first run
			database: sqlite({ url: "file:./data.db" }),
			// Local file storage — uploads saved to ./uploads/ folder
			storage: local({
				directory: "./uploads",
				baseUrl: "/_emdash/api/media/file",
			}),
			plugins: [
				{
					id: "gozzy-email-cloudflare",
					entrypoint: path.resolve(__dirname, "./src/plugins/gozzy-email-cloudflare/index.ts").replace(/\\/g, "/"),
				},
			],
		}),
	],
	devToolbar: { enabled: false },
});
