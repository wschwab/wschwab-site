# PRD — wschwab personal site

Personal site for William Schwab: career tool for job searches, project showcase,
and writing hub. Design direction is locked and demonstrated in
`design/mockup-v4.html` — that file is the visual source of truth; this document
specifies everything the mockup doesn't.

## Positioning (content rules, not suggestions)

1. **Blockchain first.** Hero and above-the-fold identity: smart contract
   development + engineering leadership, Ethereum ecosystem since 2017.
2. **AI is present but never overclaimed.** William writes *about* AI research
   and ethics and builds agentic tooling; nothing on the site may call him an
   AI researcher. The sanctioned framing: ML coursework in 2017 predates the
   blockchain career; he is "circling back" through writing. ("I'm not claiming
   a research career. Yet.")
3. **Voice:** direct, technical, dry humor in designated zones only (terminal
   block, footer `*tips hat*`, `whoami → smart contract dude`). Body copy stays
   straight.
4. **Curation over completeness on the landing page.** Landing shows exactly
   3 writing cards and 6 work cards. Everything else lives in the archives.

## Information architecture

| Route | Content |
|---|---|
| `/` | One-page narrative scroll: hero → about + timeline → selected work → writing → contact. Mirrors mockup exactly. |
| `/work/` | All projects, card grid (superset of landing's 6). |
| `/work/<slug>/` | Case-study page per project. Unlimited length; MDX. |
| `/writing/` | Full archive: Substack + Mirror + Medium entries with dates. Older/off-topic material (e.g. Xen dual-boot tutorial, pre-Merge validator guide) under a visually separated "Older & assorted" section. |
| `/writing/<slug>/` | Only for locally-hosted essays (optional, later). External pieces link out. |
| `404` | Terminal-styled: `ws@ethereum:~$ cat <path> — no such file`. |

## Stack

- **Astro** (static output, zero framework JS shipped; the only client JS is the
  ambient canvas + IntersectionObserver reveals, as inline scripts like the mockup).
- **Content collections** with zod schemas (below). Adding a project or writing
  entry = adding one markdown file.
- **Vanilla CSS** with custom-property tokens extracted from the mockup into
  `src/styles/tokens.css`. No Tailwind.
- **Fonts self-hosted** as subset woff2 (Instrument Serif 400/400i, JetBrains
  Mono 400/500 — the exact subsets are in `design/assets-b64.json`), `font-display: swap`.
- Hosting: Cloudflare Pages (see `DEPLOY.md`).

## Content model

`src/content/work/*.md`:

```yaml
title: Alchemix            # card + page title
slug: alchemix
role: Engineering Manager
period: 2024–2025
tags: [DeFi, Leadership, Audits]
summary: >-                # card body, ≤ 40 words
  Engineering manager for the next generation of the Alchemix protocol...
featured: 4                # 1–6 = landing slot (order); absent = /work/ only
links: [{label: alchemix.fi, url: ...}]
draft: false
```

Body = the case study (MDX allowed). Card `read case study →` goes to the page.

`src/content/writing/*.md`:

```yaml
title: Understanding Events
kind: Technical            # eyebrow label
venue: Medium              # Medium | Mirror | Substack | local
url: https://medium.com/linum-labs/everything-you-ever-wanted-to-know-...
date: 2021-XX-XX
summary: Everything you ever wanted to know about events and logs on Ethereum.
featured: 2                # 1–3 = landing slot; absent = archive only
archive_section: main      # main | older
```

External entries have empty bodies; `venue: local` entries render at
`/writing/<slug>/`.

### Initial content inventory

Work (6 featured, in order): ViFi, Alchemix, Polygon Labs, Ethereum Cat
Herders, Belisarius (0xa57), Tools & Nodes — copy exactly as in the mockup
(v5). Do NOT add JAT/CCCC cards — William did not create those tools; he built
skills on top of them, and there is nothing public enough to showcase yet.
**Belisarius gets a full case study at `/work/belisarius/`** (flagship
reverse-engineering piece: manually decompiling a prolific MEV bot's unverified
bytecode; strategy reconstruction ongoing; assets: series starting at
https://paragraph.com/@wschwab/belisarius-and-the-horde-chapter-0-the-portal
(Chapter 0; later chapters on Mirror, e.g. Ch. 2
https://mirror.xyz/wschwab.eth/cB8O2y3BqKublvhEhgsg7iX1B-Aee_cGCBZ5K6NWkFA),
an incomplete public Kaggle dataset; a private GitHub repo exists — mention,
never link, while private) cross-linked from the writing card.

**Where this document and the mockup conflict, this document wins on content;
the mockup wins on visuals.**

Writing (3 featured): latest-from-Substack (dynamic), Understanding Events,
the 0xa57 series. Archive additionally: pre-Merge Prysm+Nethermind validator
guide, Xen dual-boot tutorial (`archive_section: older`), remaining Medium pieces.

Timeline (8 stops) and about copy: exactly as mockup v4.

## Integrations

- **Substack "latest essay" card:** at build time, fetch
  `https://wschwab.substack.com/feed`, parse the newest item (title, link, date,
  first ~30 words of description). Fallback if fetch fails: static link to the
  Substack. Freshness comes from the daily scheduled rebuild (DEPLOY.md §8).
- No analytics initially; if wanted later, Cloudflare Web Analytics (cookieless,
  free, one script tag).
- No contact form — mailto + socials only.

## Design system notes (beyond the mockup)

- Tokens: `--ink #070d1a · --panel #0c1526 · --panel-2 #101b31 · --line #1c2a45 ·
  --amber #f2a93c · --amber-bright #ffd28a · --cyan #5cd6e8 · --text #e9e7e0 ·
  --muted #8fa0bf`. Amber = primary accent/warmth; cyan = secondary, circuits
  and "future" markers only. Single committed dark theme; no light mode.
- Case-study pages reuse the section grammar: mono eyebrow + serif title +
  hairline, prose column ≤ 68ch, code blocks in JetBrains Mono on `--panel`
  with `overflow-x: auto`.
- Motion: hero load sequence on `/` only; scroll reveals everywhere; all motion
  gated behind `prefers-reduced-motion`. Canvas runs only on `/`.
- OG image: 1200×630 static export of the hero treatment (navy ground, glow,
  name in Instrument Serif, pfp). Generate once, ship as `/og.png`.

## SEO / meta

- Title pattern: `William Schwab` (home), `<title> — William Schwab` (subpages).
- Meta description from positioning rule 1. Sitemap + robots via Astro
  integrations. Canonical URLs on all pages. `rel=me` links to GitHub/Twitter.

## Performance & a11y budgets

- Lighthouse ≥ 95 across the board on `/` (mobile).
- Total JS < 10 KB; fonts ≤ 120 KB total; pfp served as ~35 KB jpg (as-is).
- Keyboard navigable, visible focus states, WCAG AA contrast (already satisfied
  by tokens), semantic landmarks, single `h1` per page.

## Non-goals (v1)

Blog CMS, comments, dark/light toggle, i18n, contact form, ENS/IPFS mirror
(explicitly deferred — nice narrative fit, revisit post-launch).

## Open items

- [x] Domain: **wschwab.xyz** (already owned; see DEPLOY.md §6)
- [ ] Owner hand-edit copy pass before go-live (details, tone, fact check)
- [ ] Mirror URLs for the 0xa57 series entries
- [ ] Dates/URLs for remaining Medium pieces (archive)
- [ ] OG image generation pass
- [ ] 0xa57 case-study body (owner writes; agent scaffolds page)

## Acceptance criteria

1. `/` is visually indistinguishable from `design/mockup-v4.html` modulo
   resolved open items, at 375 px, 768 px, and 1440 px widths.
2. Adding `src/content/work/foo.md` with `featured: 3` reorders the landing
   grid with no other change.
3. Substack card shows the real latest post after a rebuild; site still builds
   with network blocked (fallback path).
4. All budgets in §Performance met; `prefers-reduced-motion` renders everything
   static and complete.
5. Every external link from the CV inventory resolves (no `#` hrefs in prod).
