# AGENTS.md — wschwab-site

Personal website for William Schwab, live at **https://wschwab.xyz**. It is a
career tool serving two audiences at once: hiring engineers/protocol teams
evaluating him, and technical peers reading for content. Surface is a one-page
landing (`/`) plus work case-studies (`/work/<slug>/`), a writing archive
(`/writing/`), and a flagship slideshow deck (`/rice/`) documenting two Linux
desktop "rices."

The defining trait is **permanence discipline**: the repo is public, deploys to
Cloudflare Pages automatically on push to `main`, and every publish is
additionally pinned to IPFS/IPNS and mirrored to Radicle, so publishes are
effectively permanent and not revertable by a history rewrite. Treat any content
change as shipping to production (and IPFS) permanently.

## Stack

- **Astro 5** static site (package.json: `astro ^5.10.0`), zero UI/JS framework.
- **Node 22** in CI; package manager is **npm** (`npm ci` in CI).
- **TypeScript**; strictness is managed by Astro's generated `.astro/*.d.ts`
  (no `tsconfig.json` is checked in — don't create one).
- **Vanilla CSS** only, via custom properties in `src/styles/record-tokens.css`.
  No Tailwind or CSS framework.
- **Content:** Astro content collections with zod schemas in
  `src/content.config.ts`. Adding a project/essay = adding one markdown file.
- VCS is **jujutsu (jj)** colocated with git. See "Publishing" below — do not
  reach for raw `git`/`jj` as a shortcut.

## Commands (from package.json — safe from fish)

```sh
npm ci                 # install (CI uses this; npm install also works)
npm run dev            # astro dev — local dev server
npm run build          # astro build → dist/ (the only correctness gate)
npm run preview        # astro preview — serve the built dist/ locally
```

There are **no** test, lint, formatting, or typecheck scripts or config. Build
is the only gate: if `npm run build` passes, the change is production-shaped.

## Publishing — the ONLY publish path

`./commit "<message>"` is the sole sanctioned way to publish. It is a committed
bash script at repo root that: `jj commit` + explicitly advances the `main`
bookmark, pushes to GitHub (triggers the Cloudflare deploy) and the Radicle
mirror, runs the build, pins `dist/` to IPFS/IPNS, and prints ready-to-sign
WNS/GNS `setContenthash` calldata.

Do **not** write your own push logic or use plain `git push`/`jj git push`. Any
path that bypasses `./commit` desyncs Radicle, IPFS, and the on-chain contenthash
— and a plain `jj commit`/`git commit` does not even advance the `main` bookmark,
so it may silently not deploy at all while looking done.

`./commit` needs an interactive terminal (Radicle auth spawns an ssh-agent) and
a running kubo `ipfs daemon`. It exits nonzero if either is missing. Note the
script is bash (`#!/usr/bin/env bash`) — invoke it from fish as a script, don't
reimplement its steps ad hoc.

## Deploy / hosting

- Hosting: **Cloudflare Pages**, project name `wschwab-site`, production branch
  `main`, domain `wschwab.xyz` (CNAME → `.pages.dev`, proxied).
- CI: `.github/workflows/deploy.yml` deploys on **push to `main`**, on a daily
  cron at `23 5 * * *` (keeps the Substack card fresh), and on
  `workflow_dispatch`. There is no staging branch or env.
- Manual deploy (rarely needed): `wrangler pages deploy dist --project-name
  wschwab-site` with `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` env vars.
  There is **no `wrangler.toml`** — Cloudflare config lives in env/secrets and CLI
  flags.

## Content model & conventions

Frontmatter is validated by zod in `src/content.config.ts`.

- **`src/content/work/*.md`** — case studies. Required: `title`, `role`,
  `period`, `tags` (array), `summary`. Optional: `featured` (int 1–6, landing
  exhibit order — up to 6 shown on landing), `cta`, `external` (card links out
  instead of `/work/<slug>/`), `links[]`, `soft_tags`, `draft`.
- **`src/content/writing/*.md`** — essays. Required: `title`, `kind` (genre
  label), `summary`. `venue` is an enum `['Medium','Mirror','Paragraph',
  'Substack','local']`; `url` required unless `venue: local`. Optional: `date`,
  `featured` (int 1–3), `archive_section` (`main`|`older`), `draft`.
- **Landing slots:** `index.astro` shows up to 6 `featured` work items as
  exhibits, and 3 writings: the live Substack card plus `featured` 2 and 3.
  Don't invent new slot counts.

### Pages (`src/pages/`)

- `index.astro` — landing ("the Certified Record": binding, caption, testimony,
  docket, exhibits, writings incl. the live Substack card, certificate).
- `work/index.astro` + `work/[slug].astro` — case-study list + pages via
  `getStaticPaths` over non-draft work.
- `writing/index.astro` — archive (main + "Older & assorted" sections). Cards
  link out to `e.data.url`; there is **no** `writing/[slug].astro`.
- `rice/{index,scope,riso}.astro` — the `/rice/` slideshow deck.
- `404.astro`.

### Key conventions

- **Every layout's `<head>` comes from `src/layouts/Head.astro`**
  (`src/layouts/Record.astro` and `Deck.astro` wrap it). Do **not** duplicate
  meta tags into a new layout (DESIGN.md).
- **`src/data/rice-progress.json` is the single source of truth** for all `/rice/`
  status claims. It currently carries `_seed: true` — phase states and generation
  numbers are **hand-seeded ESTIMATES**, not host truth. Don't drop `_seed` or
  edit the numbers without binding to the real external ricing ledger
  (`~/Projects/laptop-ricing/`); the deck renders a "seed data" marker while
  seeded, and honesty in the rendering is a documented contract (DESIGN.md).
- **Substack card is generated at build:** `src/lib/substack.ts` fetches
  `https://wschwab.substack.com/feed` (10 s timeout, static fallback). Any
  hand-edit to that card's text in `index.astro` is overwritten on the next
  build (daily cron keeps it fresh).
- **Not a renderer for `venue: local`:** the schema permits `venue: 'local'`,
  but no `writing/[slug].astro` exists, so a local essay would render a card
  linking to a 404. Add the renderer before adding local essays.
- **Style (DESIGN.md):** pleading-paper record — ruled line-number rail,
  Century (TeX Gyre Schola) throughout, Share Tech Mono only for hashes/data,
  editions + stock-finish picker in the margin strip. Fonts self-hosted in
  `public/fonts/` (plus Redaction/iA/3270/Fira for the rice deck). The v4
  "night sky" site is frozen on IPFS (`ARCHIVE_V4` in `src/lib/record.ts`).
- **Product copy constraints (PRD.md/PRODUCT.md) are hard rules, not
  suggestions:** no "AI researcher" framing; JAT/CCCC projects must not be
  showcased or credited; blockchain-first hero.

## Layout

- Docs: `agent-docs/` (`PRD.md`, `DEPLOY.md`, `DESIGN.md`, `DESIGN-v4.md`,
  `REDESIGN-PLAN.md`, `PRODUCT.md`, `RICE-DECK-BRIEF.md`, paper-texture
  generators) is **gitignored / private** — do not commit it.
- `design/` — `og-source.html` (source of `public/og.png`), `mockup-v4.html`
  (v4 history, no longer the visual reference), fonts, `assets-b64.json`;
  committed.
- `public/` — `fonts/`, `paper/` (stock-finish AVIF tiles), `og.png`,
  `favicon.svg`, `robots.txt`, `_redirects` (`/next/*` → `/`, where the record
  was staged), `pfp.jpg`.
- `src/` — `components/record/`, `styles/` (`record-tokens.css`, `record.css`,
  `record-paper.css`; deck styles), `layouts/` (`Record.astro`, `Head.astro`,
  `Deck.astro` used only by `/rice/`), `pages/`, `data/`, `lib/`, `content/`.
- Gitignored: `node_modules/`, `dist/`, `.astro/`, `.wrangler/`, `.claude/`,
  `.impeccable/`, `agent-docs/`.

## Getting up to speed

Read `agent-docs/PRD.md` (product + content model) then `agent-docs/DESIGN.md`
(visual system) for a complete picture. `DEPLOY.md` contains a stale git-scaffold-from-scratch section
that predates this repo's jj migration — ignore its history commands and use
`./commit`, not the workflow it describes.
