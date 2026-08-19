# wschwab-site watchdog

Personal website for William Schwab (`wschwab.xyz`), a public static Astro 5
site on Cloudflare Pages. Push to `main` auto-deploys to production, and a root
`./commit` script additionally pins every publish to IPFS/IPNS, mirrors it to
Radicle, and emits on-chain `setContenthash` calldata — so **nothing published is
ever revertable**, and content is world-readable the moment it builds.

## Publish path (single point of failure) — blocker
`./commit "<msg>"` (repo-root bash script) is the ONLY sanctioned publish path:
it `jj commit`, explicitly advances the `main` bookmark, pushes GitHub + Radicle,
builds, pins `dist/` to IPFS/IPNS, and prints WNS/GNS contenthash calldata
(`commit` script header comment: "Cloudflare deploys via GitHub Actions on push;
this script handles the mirrors"). Any agent reaching for plain
`jj git push`/`git push`/`jj bookmark` instead:
- skips `jj bookmark set main -r @-` (`commit` line: `jj bookmark set main -r @-`)
  → change may not deploy at all while looking committed; and
- desyncs the IPFS/IPNS pin, Radicle mirror, and on-chain pointer
  (PRODUCT.md: "Do not write your own push logic").
A plain `jj commit` also does **not** move `main`. Flag any VCS or deploy command
other than `./commit`. Note `./commit` is bash and needs an interactive terminal
(Radicle `rad auth` via spawned ssh-agent) plus a running `ipfs daemon`; it exits
nonzero when either is missing — a nonzero exit means the change is NOT published
permanently, even if GitHub shipped.

## Push to main = immediate public production — blocker
`.github/workflows/deploy.yml` deploys on `push: branches: [main]`, on a daily
cron (`23 5 * * *` — keeps the Substack card fresh), and on `workflow_dispatch`.
The repo is public (`wschwab/wschwab-site` on GitHub) and there is **no staging
branch or env**. Editing any content markdown ships it to the live site and
pins it on IPFS; a history rewrite cannot un-publish it. Advisors should treat
"change a content file" as "publish to the public, permanently." Build is the
only correctness gate — there are no tests, lints, or typechecks.

## Private docs are gitignored — do not commit them — blocker
`.gitignore` lists `PRODUCT.md` and `RICE-DECK-BRIEF.md` (plus `.claude/`,
`.impeccable/`, `.wrangler/`, `.astro/`, `dist/`, `node_modules/`). These two
docs are deliberately private strategy/palette-source material; adding them to a
commit publishes private content in a repo that pushes to a public remote and
IPFS. Conversely, anything new placed at repo root is committed and public by
default.

## Substack card is generated at build — concern
`src/lib/substack.ts` fetches `https://wschwab.substack.com/feed` at build time
(10 s timeout, static `FALLBACK` card) and `index.astro` renders it. Hand-editing
that card's text in `index.astro` is overwritten on the next build (the daily
cron rebuild ensures freshness). Don't "fix" the card's copy in source expecting
it to persist.

## `/rice/` status is seeded estimates, not host truth — concern
`src/data/rice-progress.json` carries `_seed: true` and a `_note` that phase
states and generation numbers are ESTIMATES bound to the external
`~/Projects/laptop-ricing/IMPLEMENTATION-v3.md` ledger; the deck renders a "seed
data" marker while seeded. Editing those numbers, or dropping `_seed` without
binding to the real ledger, silently publishes fabricated status on a deck whose
honesty (auto-disappearing mock tags, visible staleness) is a stated product
contract (DESIGN.md). The four deck palettes are "bound to real machines" and
not open to reinterpretation — e.g. TokyoNight dim must stay `#a9b1d6`, not
`#565f89` (DESIGN.md calls this a known regression). Treat any `rice-progress.json`
mutation as content-authored, reviewer-trusting change.

## jj-colocated workflow traps — concern
VCS is jujutsu colocated with git (`.jj/repo/store/type` = `git`; `.git/config`
has `origin` = public GitHub + `rad` remote). Routine `jj` ops auto-snapshot the
working copy; DEPLOY.md §§1–2 document a stale git-scaffold-from-scratch flow
(`git init`, `gh repo create`, etc.) that predates this repo's jj migration —
following it is wrong. Agents reaching for raw `git`/`jj` rather than `./commit`
are the red flag to catch.

## Stale duplicate tree inside the repo — concern
`.claude/worktrees/work-cards/` is a full older copy of the project on disk
(own `package.json`, `.github/`, and an older 2.7 KB `commit` script) from a past
task. Broad greps/edits can hit the copy instead of the live tree and produce the
illusion of a change that never ships. `.claude/` and `.astro/` are both
gitignored/generated. Direct any agent away from paths under `.claude/`.

## Secrets live only in GitHub Actions — concern
No `.env` and no `wrangler.toml` exist in the repo; Cloudflare credentials are
the `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` secrets in
`.github/workflows/deploy.yml`. Advise against creating or committing `.env*`
files or inline tokens (DEPLOY.md §3 suggests `~/.config/fish/conf.d/` or a
secrets store). Manual deploy would use `wrangler pages deploy dist
--project-name wschwab-site` with those env vars.

## `venue: local` writing has no renderer — concern
`src/content.config.ts` allows `venue: 'local'` (with absent `url`), but there is
no `src/pages/writing/[slug].astro` — only `writing/index.astro`, which links
cards to `e.data.url`. A `venue: local` entry would build a card linking to a
404. Adding local essays requires the renderer first.

## Product copy constraints are hard rules — concern
PRD.md/PRODUCT.md set non-negotiable content rules: no "AI researcher" framing,
JAT/CCCC must not be showcased or credited, blockchain-first hero, and the
landing shows exactly 3 writing / 6 work featured slots (featured ints in
frontmatter, sorted ascending in `index.astro`). Copy edits violating these break
the product contract; a plausible-sounding "more modern hero" rewrite is a trap.
