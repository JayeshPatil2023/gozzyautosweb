# Gozzy Autos Web — Beginner's Guide to EmDash CMS

> **Who is this guide for?**
> If you're new to EmDash CMS and want to understand how this project works — from running it locally to adding new pages — this guide explains everything in simple, plain language.

---

## 📋 Table of Contents

1. [What is EmDash CMS?](#1-what-is-emdash-cms)
2. [Project Structure — What Each File Does](#2-project-structure)
3. [How to Run the Project Locally](#3-how-to-run-locally)
4. [First-Time Setup (Admin Account)](#4-first-time-setup)
5. [What is the Seed File?](#5-what-is-the-seed-file)
6. [How to Apply/Reset the Seed](#6-how-to-apply-the-seed)
7. [How to Add a New Vehicle in Admin](#7-adding-vehicles-in-admin)
8. [How to Add a New Page Collection to the Seed](#8-adding-new-page-collections)
9. [How to Add a New Page (e.g., Contact Us, About)](#9-adding-new-static-pages)
10. [How to Add a New Menu Link](#10-adding-menu-links)
11. [Folder Structure After Customization](#11-folder-structure)
12. [Future: Deploying to Cloudflare](#12-deploying-to-cloudflare)
13. [Common Questions & Troubleshooting](#13-troubleshooting)

---

## 1. What is EmDash CMS?

**EmDash** is a Content Management System (CMS) built for websites made with **Astro** (a modern web framework).

Think of it like this:
- **Astro** builds and renders your website (like the engine of a car 🚗)
- **EmDash** is the admin panel where you add/edit content (like the dashboard inside the car)

With EmDash you get:
- ✅ A beautiful **Admin Panel** at `http://localhost:4321/_emdash/admin`
- ✅ A **database** to store vehicles, pages, and other content
- ✅ **Media uploads** for car photos
- ✅ Your website automatically shows the latest content without rebuilding

**How is it different from WordPress?**

| Feature | WordPress | EmDash |
|---|---|---|
| Language | PHP | JavaScript (Astro) |
| Speed | Slower (server renders pages) | Very fast (modern rendering) |
| Hosting | Requires PHP server | Node.js or Cloudflare |
| Admin panel | Yes | Yes (at `/_emdash/admin`) |
| Content types | Post/Page + plugins | Custom collections (via seed) |

---

## 2. Project Structure

Here's every important file explained in simple words:

```
gozzyautosweb/
│
├── astro.config.mjs         ← Main config: tells Astro which database and
│                              storage to use. Currently uses SQLite (local).
│
├── seed/
│   └── seed.json            ← The BLUEPRINT of your website's content types.
│                              Defines what "collections" (content types) exist,
│                              what fields they have, and sample/demo content.
│                              Applied ONCE when the database is empty.
│
├── src/
│   ├── layouts/
│   │   └── Base.astro       ← The master layout. Every page uses this.
│   │                          Contains the Header and Footer.
│   │
│   ├── pages/
│   │   ├── index.astro      ← Home page (Hero + Vehicle Grid + Split section)
│   │   ├── [slug].astro     ← Generic page renderer (used for About, Contact, etc.)
│   │   └── 404.astro        ← Page not found
│   │
│   ├── styles/
│   │   └── global.css       ← All CSS styling for the site
│   │
│   ├── utils/
│   │   └── site-identity.ts ← Helper that reads site title/tagline from admin
│   │
│   ├── live.config.ts       ← Boilerplate. Don't edit. Connects Astro to EmDash.
│   └── worker.ts            ← Boilerplate for Cloudflare deployment. Don't edit.
│
├── emdash-env.d.ts          ← Auto-generated TypeScript types. Don't edit manually.
│                              Regenerated when you run `npm run dev`.
│
├── data.db                  ← SQLite database file (created automatically)
├── uploads/                 ← Folder where uploaded images are stored
│
├── wrangler.jsonc           ← Config for future Cloudflare deployment
└── package.json             ← Project dependencies and scripts
```

### Key Concept: Collections vs Pages

- A **Collection** is a content type in EmDash admin. Examples: `vehicles`, `pages`, `blog posts`.
- A **Page** in Astro (`src/pages/`) is a URL on your website.
- They work together: the Astro page **queries** content from the EmDash collection and displays it.

---

## 3. How to Run Locally

Follow these steps **in order** every time you want to run the project:

### Step 1: Open Terminal in Project Folder

Open your terminal/command prompt and go to the project folder:
```bash
cd c:\Applications\systenics\NewAstroApps\GozzyAutosWeb\gozzyautosweb
```

### Step 2: Install Dependencies (only needed first time or after pulling changes)

```bash
npm install
```

This downloads all required packages. You'll see a `node_modules` folder created.

### Step 3: Start the Dev Server

```bash
npm run dev
```

You'll see output like:
```
 astro  v7.x.x started
  🚀  Server running at: http://localhost:4321/
  🔌  Admin panel at:    http://localhost:4321/_emdash/admin
```

### Step 4: Open in Browser

- **Your website**: http://localhost:4321
- **Admin panel**: http://localhost:4321/_emdash/admin

> **Note:** The first time you run, EmDash will automatically:
> 1. Create the `data.db` SQLite file
> 2. Set up all database tables
> 3. Apply your seed file (add collections and demo content)

---

## 4. First-Time Setup

The very first time you open the admin panel (`http://localhost:4321/_emdash/admin`), you'll go through a one-time setup wizard:

1. **Create Admin Account** — Enter your name, email, and password
2. **Site Settings** — You can set your site title and tagline here (or leave defaults)
3. **Done!** — You're in the admin panel

> ⚠️ **Important:** Write down your admin email and password. There's no "forgot password" in local dev mode.

---

## 5. What is the Seed File?

The seed file (`seed/seed.json`) is the **blueprint** of your website.

**In simple words:**
> The seed file tells EmDash: "My website has these content types, with these fields."

### What's in Our Seed File

Our `seed/seed.json` defines:

#### 📦 Collections (Content Types)

**1. `vehicles`** — For car listings:
| Field | Type | Purpose |
|---|---|---|
| `title` | Text | Car name (e.g., "Maruti Swift 2023") |
| `featured_image` | Image | Main car photo |
| `make` | Text | Brand (e.g., "Maruti Suzuki") |
| `model` | Text | Model name (e.g., "Swift") |
| `year` | Number | Year of manufacture |
| `price` | Number | Price in Rupees |
| `mileage` | Number | Kilometers driven |
| `fuel_type` | Text | "Petrol", "Diesel", "Electric" |
| `transmission` | Text | "Manual" or "Automatic" |
| `short_description` | Text | Brief description for the card |
| `is_featured` | Yes/No | Show on home page? |

**2. `pages`** — For static pages like About Us, Contact Us:
| Field | Type | Purpose |
|---|---|---|
| `title` | Text | Page title |
| `content` | Rich Text | Page content (formatted text) |

#### 🗺️ Menus
Defines the navigation links in the header:
- Home (`/`)
- Vehicles (`/vehicles`)

#### 📝 Sample Content
6 demo vehicles and 1 About Us page, added automatically when the database is first created.

---

## 6. How to Apply the Seed

### When is the Seed Applied Automatically?

The seed is applied **automatically** when:
1. The database (`data.db`) is empty (first run)
2. The setup wizard has not been completed yet

**So on first run, you don't need to do anything!**

### How to Reset / Reapply the Seed (Start Fresh)

If you want to reset your database and start over:

```bash
# Step 1: Stop the dev server (press Ctrl+C)

# Step 2: Delete the database file
del data.db

# Step 3: Start the dev server again — seed will be applied automatically
npm run dev
```

> ⚠️ **Warning:** This deletes ALL content including vehicles you may have added. Only do this during development/POC phase.

### Manual Seed Apply (Advanced)

If you need to apply the seed manually (e.g., the database exists but is incomplete):

```bash
npx emdash seed apply
```

---

## 7. Adding Vehicles in Admin

Once the site is running:

1. Go to http://localhost:4321/_emdash/admin
2. Click **"Vehicles"** in the left sidebar
3. Click **"New Vehicle"** button
4. Fill in:
   - **Title**: e.g., "Toyota Innova 2022"
   - **Make**: "Toyota"
   - **Model**: "Innova"
   - **Year**: 2022
   - **Price**: 1800000
   - **Fuel Type**: "Diesel"
   - **Transmission**: "Manual"
   - **Featured Image**: Upload a car photo
   - **Show on Home Page**: ✅ (check this to show on home page grid)
4. Click **"Publish"**

Your vehicle will instantly appear on the home page without restarting!

---

## 7.5 How Page Content & Custom Sections Work in EmDash CMS

In EmDash CMS and Astro, pages with different sections and fields are handled using **two content patterns**:

### Pattern A: Dedicated Page Singleton Collections (For Pages with Specific Fixed Sections)
Pages like the **Home Page**, **About Us Page**, or **Contact Us Page** often have specific sections (Hero headline, CTA buttons, stats counters, team grids, location maps).

For these pages, we define a dedicated collection in `seed/seed.json` (such as `home_page`):
- **Hero Badge Text** (`string`)
- **Hero Headline Title** (`string`)
- **Hero Accent Text** (`string`)
- **Hero Subheadline Description** (`text`)
- **Primary & Secondary CTA Labels/Links** (`string`)
- **Stats Counters (Value & Label)** (`string`)
- **Section Taglines & Headings** (`string`)

**Editing in Admin:**
1. Go to `http://localhost:4321/_emdash/admin`
2. Click **"Home Page Sections"** in the sidebar
3. Edit any headline, subtitle, button link, or stat counter value
4. Click **Publish** — the Home Page updates instantly!

---

### Pattern B: Modular Section Builder Pages (For Any Dynamic Custom Page)
For dynamic pages created via **"New Page"** in Admin (e.g. `/about`, `/contact`, `/services`, `/inquiry`), editors can use the **Page Sections (Section Builder)** field to stack sections in any order:

**Available Section Layout Styles:**
1. **`hero`**: Premium Hero section with dark overlay, animated badge, headline title, subheadline, and primary & secondary CTA buttons (styled identical to the Home Page Hero).
2. **`full-width`**: Standard centered content section block.
3. **`split-image-right`**: Left-side text/HTML content, right-side image.
4. **`split-image-left`**: Left-side image, right-side text/HTML content.
5. **`cta-banner`**: Glassmorphic CTA card block with button.

**Section Fields:**
- **Section Tag / Badge** (Badge text above heading)
- **Section Heading Title** (Primary heading)
- **Section Layout Style**:
  - `hero`: Premium Hero section with dark gradient overlay. **Background image is selected by the admin from the media gallery (via the Image field). If no image is uploaded, it renders a clean dark gradient overlay without any image.**
  - `full-width`: Standard centered content section block.
  - `split-image-right`: Left-side text/HTML content, right-side image.
  - `split-image-left`: Left-side image, right-side text/HTML content.
  - `cta-banner`: Glassmorphic CTA card block with button.
- **Container Width Style**:
  - `default` / Unspecified: Standard Container Width (`1280px` / `var(--max-width)`) — **ideal for vehicle card grids, multi-column cards, wide HTML tables, and full page section content!**
  - `reading`: Medium Reading Width (`900px`) — for articles and body copy.
  - `narrow`: Focused Narrow Width (`700px`) — for single-column text or forms.
  - `full`: 100% Full Bleed (`100%`) — edge-to-edge unconstrained layout.
- **Section Content** (HTML or text body)
- **Primary Button Text & Link** (Primary CTA button)
- **Secondary Button Text & Link** (Secondary CTA button for `hero` sections)

---

## 8. Adding New Page Collections to the Seed

In the future, if you want to add a **new content type** (e.g., "Car Brands", "Testimonials", "Blog Posts"), here's how to do it.

### Example: Adding a "Testimonials" Collection

Open `seed/seed.json` and find the `"collections"` array. Add a new item:

```json
{
  "slug": "testimonials",
  "label": "Testimonials",
  "labelSingular": "Testimonial",
  "supports": ["drafts"],
  "fields": [
    {
      "slug": "customer_name",
      "label": "Customer Name",
      "type": "string",
      "required": true
    },
    {
      "slug": "rating",
      "label": "Rating (1-5)",
      "type": "integer"
    },
    {
      "slug": "review",
      "label": "Review",
      "type": "text",
      "searchable": true
    },
    {
      "slug": "car_purchased",
      "label": "Car Purchased",
      "type": "string"
    }
  ]
}
```

### Available Field Types

| Type | Use For | Example |
|---|---|---|
| `string` | Short text (single line) | Name, make, model |
| `text` | Long text (multi-line) | Description, review |
| `integer` | Whole numbers | Year, rating, count |
| `number` | Decimal numbers | Price, mileage |
| `boolean` | Yes/No checkbox | Is Featured, Is Active |
| `image` | Photo upload | Car image, profile photo |
| `portableText` | Rich text editor | Page content, blog post body |
| `datetime` | Date and time | Event date, expiry date |

### After Adding a New Collection:

1. **Stop the dev server** (Ctrl+C)
2. **Delete the database**: `del data.db`
3. **Restart**: `npm run dev`
4. The new collection will appear in the admin panel sidebar

> 💡 **Future tip:** Once you're done with the POC and ready to go live, you won't delete the database anymore. Instead, EmDash supports schema migrations to add new collections without losing data.

---

## 9. Adding New Static Pages (About Us, Contact, etc.)

Static pages (like About Us, Contact Us) use the **`pages` collection** which already exists in the seed.

### Step 1: Create the Content in Admin

1. Go to `/_emdash/admin` → click **"Pages"** in sidebar
2. Click **"New Page"**
3. Set:
   - **Title**: "Contact Us"
   - **Content**: Your page content (rich text editor)
   - **Slug**: `contact` (this becomes the URL: `/contact`)
4. Click **Publish**

### Step 2: The URL is Automatic

Your page is now at: `http://localhost:4321/contact`

This works because `src/pages/[slug].astro` automatically handles any page slug from the `pages` collection.

### Step 3: Add it to the Navigation Menu

Add it in the seed file or in the admin:

**In `seed/seed.json` → `menus` section:**
```json
{
  "name": "primary",
  "label": "Primary Navigation",
  "items": [
    { "type": "custom", "label": "Home", "url": "/" },
    { "type": "custom", "label": "Vehicles", "url": "/vehicles" },
    { "type": "custom", "label": "Contact", "url": "/contact" }
  ]
}
```

**Or in Admin (live, no restart needed):**
1. Go to `/_emdash/admin` → **Settings** → **Menus**
2. Edit the "Primary Navigation" menu
3. Add a new item with Label: "Contact" and URL: "/contact"
4. Save

---

## 10. Adding Menu Links

### Adding via the Seed File

Menu items go in the `"menus"` section of `seed/seed.json`:

```json
"menus": [
  {
    "name": "primary",
    "label": "Primary Navigation",
    "items": [
      { "type": "custom", "label": "Home",      "url": "/" },
      { "type": "custom", "label": "Vehicles",  "url": "/vehicles" },
      { "type": "custom", "label": "About Us",  "url": "/about" },
      { "type": "custom", "label": "Contact",   "url": "/contact" }
    ]
  }
]
```

> Note: Changes to the seed only take effect after a database reset. For live changes, use the admin panel.

### Adding via Admin (No Restart)

1. `/_emdash/admin` → **Settings** → **Menus**
2. Click the pencil icon on "Primary Navigation"
3. Click **"Add Item"**
4. Set Label and URL
5. Click **Save**

The header navigation updates immediately!

---

## 11. Folder Structure After Customization

After our changes, the project looks like this:

```
gozzyautosweb/
├── astro.config.mjs     ← ✅ Changed: SQLite + Local storage + Node adapter
├── seed/
│   └── seed.json        ← ✅ Changed: Vehicles collection, Gozzy branding
├── src/
│   ├── layouts/
│   │   └── Base.astro   ← ✅ Changed: Gozzy header/footer
│   ├── pages/
│   │   ├── index.astro  ← ✅ Changed: Hero + Vehicles + Split section
│   │   ├── [slug].astro ← Kept as-is (handles About, Contact pages)
│   │   └── 404.astro    ← ✅ Updated: Styled 404 page
│   │   (posts/ removed)
│   │   (category/ removed)
│   │   (tag/ removed)
│   ├── styles/
│   │   └── global.css   ← ✅ New: Premium dark automotive theme
│   └── utils/
│       └── site-identity.ts ← ✅ Updated: "Gozzy Autos" defaults
├── data.db              ← Auto-created: SQLite database
└── uploads/             ← Auto-created: Uploaded media files
```

**What was removed (blog-specific, not needed for car dealership):**
- ❌ `src/pages/posts/` — Blog post pages
- ❌ `src/pages/category/` — Category archive pages  
- ❌ `src/pages/tag/` — Tag archive pages

**What stays but will be built in future:**
- `src/pages/vehicles/index.astro` — All vehicles listing page
- `src/pages/vehicles/[slug].astro` — Individual vehicle detail page

---

## 12. Future: Deploying to Cloudflare

When you're ready to go live on Cloudflare (not needed for POC):

### Step 1: Switch to Cloudflare Config

Change `astro.config.mjs` back to:

```javascript
import cloudflare from "@astrojs/cloudflare";
import { d1, r2 } from "@emdash-cms/cloudflare";
import emdash from "emdash/astro";

export default defineConfig({
  adapter: cloudflare(),
  integrations: [
    react(),
    emdash({
      database: d1({ binding: "DB", session: "auto" }),
      storage: r2({ binding: "MEDIA" }),
    }),
  ],
});
```

### Step 2: Create Cloudflare Resources

```bash
# Create D1 database
wrangler d1 create gozzy-autos-db

# Create R2 storage bucket
wrangler r2 bucket create gozzy-autos-media
```

### Step 3: Deploy

```bash
npm run deploy
```

> 📖 The `wrangler.jsonc` file is already set up with the correct names (`gozzy-autos-db`, `gozzy-autos-media`) for when you deploy.

---

## 13. Common Questions & Troubleshooting

### ❓ "The site is running but I see no vehicles on the home page"

This happens if the seed didn't apply. Solution:
1. Stop server (Ctrl+C)
2. Delete `data.db` file
3. Run `npm run dev` again
4. Complete the admin setup wizard

### ❓ "I added a vehicle in admin but it doesn't show on the home page"

Check if **"Show on Home Page"** is checked for that vehicle. Only vehicles with `is_featured = true` appear in the home grid.

### ❓ "I get a TypeScript error about vehicle fields"

The `emdash-env.d.ts` file needs to be regenerated. While the dev server is running:
```bash
npx emdash types
```

### ❓ "Can I change the site title/tagline?"

Yes! Go to `/_emdash/admin` → **Settings** → **Site Settings**. Change the title and tagline there. The header will update automatically.

### ❓ "Where are uploaded images stored?"

In the `uploads/` folder inside the project. This is fine for local development. On Cloudflare, they'll go to R2 bucket.

### ❓ "How do I add more sections to the home page?"

Edit `src/pages/index.astro`. Each section is clearly commented with:
- `SECTION 1: HERO`
- `SECTION 2: MOST SEARCHED VEHICLES`
- `SECTION 3: WHY CHOOSE US`

Copy a section pattern and add your own below.

### ❓ "My changes in seed.json are not showing up"

The seed is only applied once (when database is empty). To see seed changes, you must reset the database:
1. Stop server
2. Delete `data.db`  
3. Restart: `npm run dev`

### ❓ "Can I have vehicles that don't show on home page?"

Yes! Uncheck **"Show on Home Page"** in the admin. The vehicle will still exist in the database but won't appear in the home grid. It will appear on the `/vehicles` page (to be built later).

### ❌ Error: `ERR_INVALID_ARG_VALUE: The argument 'filename' must be a file URL object...`

**Full error message you'll see:**
```
TypeError [ERR_INVALID_ARG_VALUE]: The argument 'filename' must be a file URL object,
file URL string, or absolute path string. Received 'file:///emdash-registry-verification.js'
    at createRequire (node:internal/modules/cjs/loader:...)
    at eval (...node_modules\registry-verification\dist\index.js:8:33)
```

**What is happening?**

EmDash versions **above `0.35.0`** (e.g. `0.36`, `0.37`) shipped a dependency (`registry-verification`) that has a bug — it uses a hardcoded fake URL (`file:///emdash-registry-verification.js`) which Node.js on Windows cannot resolve.

**This is a bug in EmDash versions > 0.35.0** that affects Windows local development.

**The fix: use EmDash `0.35.0`** (already set in this project's `package.json`):

Open `package.json` and make sure the versions are pinned to `0.35.0`:

```json
"dependencies": {
  "@emdash-cms/cloudflare": "0.35.0",
  "emdash": "0.35.0"
}
```

Then reinstall:
```bash
npm install --legacy-peer-deps
```

Then restart the dev server:
```bash
npm run dev
```

> ✅ **Already fixed** in this project — `package.json` uses `emdash@0.35.0` and `@emdash-cms/cloudflare@0.35.0`.
> If you upgrade emdash in the future and see this error, downgrade back to `0.35.0` until the EmDash team releases a fix.

---

## 🎯 Quick Reference

| Task | How to do it |
|---|---|
| Start the site | `npm run dev` |
| Open website | http://localhost:4321 |
| Open admin | http://localhost:4321/_emdash/admin |
| Add a vehicle | Admin → Vehicles → New Vehicle |
| Add a page (About, Contact) | Admin → Pages → New Page |
| Add a nav link | Admin → Settings → Menus |
| Reset database | Delete `data.db`, restart server |
| Regenerate types | `npx emdash types` (while server runs) |
| Add new collection | Edit `seed/seed.json`, reset database |

---

## 📁 Files Modified in This Customization

| File | What Changed |
|---|---|
| [`astro.config.mjs`](../astro.config.mjs) | SQLite + Local storage + Node.js adapter |
| [`seed/seed.json`](../seed/seed.json) | Vehicles collection, Gozzy branding, sample cars |
| [`src/layouts/Base.astro`](../src/layouts/Base.astro) | Gozzy Autos header + footer |
| [`src/pages/index.astro`](../src/pages/index.astro) | Hero + Vehicles grid + Split section |
| [`src/pages/404.astro`](../src/pages/404.astro) | Styled 404 page |
| [`src/styles/global.css`](../src/styles/global.css) | Complete premium CSS theme |
| [`src/utils/site-identity.ts`](../src/utils/site-identity.ts) | Default title/tagline to Gozzy Autos |
| [`wrangler.jsonc`](../wrangler.jsonc) | Renamed to gozzy-autos-web/db/media |
| [`package.json`](../package.json) | Label updated to Gozzy Autos |
