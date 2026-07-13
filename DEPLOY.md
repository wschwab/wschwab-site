# DEPLOY.md — agent-friendly checklist: wschwab-site → Cloudflare Pages

Each step: **who** (agent / human / human-once), commands, and a verification.
Agents: run steps in order, verify before proceeding, stop and report on any
verification failure. `<DOMAIN>` = `wschwab.xyz` (owned); `<PROJECT>` = `wschwab-site`.

## 1. Scaffold — agent

```bash
cd ~/code/wschwab-site
npm create astro@latest . -- --template minimal --no-install --no-git --typescript strict
npm install
npm install @astrojs/sitemap
git init && git add -A && git commit -m "scaffold"
```

**Verify:** `npm run build` exits 0 and produces `dist/index.html`.

## 2. GitHub repo — agent

```bash
gh repo create wschwab-site --public --source . --push
```

**Verify:** `gh repo view --json url` returns the repo URL; `git push` clean.

## 3. Cloudflare credentials — human-once

Option A (interactive): `wrangler login` (OAuth in browser).
Option B (headless, preferred for agents): create an API token at
dash.cloudflare.com → My Profile → API Tokens → template "Edit Cloudflare
Workers" + `Pages:Edit`, then:

```bash
export CLOUDFLARE_API_TOKEN=...   # put in ~/.config/fish/conf.d/ or secrets store
export CLOUDFLARE_ACCOUNT_ID=...  # dash → Workers & Pages → right sidebar
```

**Verify:** `wrangler whoami` shows the account.

## 4. Create Pages project — agent

```bash
wrangler pages project create <PROJECT> --production-branch main
```

**Verify:** `wrangler pages project list` includes `<PROJECT>`.

## 5. First deploy — agent

```bash
npm run build
wrangler pages deploy dist --project-name <PROJECT>
```

**Verify:** command prints a `*.pages.dev` URL; `curl -sI <url>` → `HTTP/2 200`.

## 6. Domain — human-once (already owned: wschwab.xyz)

`<DOMAIN>` = `wschwab.xyz`, already registered. If the registrar is not
Cloudflare: add the site to the Cloudflare account (free plan) and switch
nameservers at the registrar to the two Cloudflare assigns (human, one-time).

**Verify:** `dig NS wschwab.xyz +short` returns `*.ns.cloudflare.com` hosts and
the domain is listed under the account's Websites.

## 7. Attach custom domain — agent

```bash
curl -sX POST "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects/<PROJECT>/domains" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"name":"<DOMAIN>"}'
# then add DNS record: CNAME <DOMAIN> → <PROJECT>.pages.dev (proxied)
```

Repeat for `www.<DOMAIN>` or add a redirect rule www → apex.

**Verify:** `curl -sI https://<DOMAIN>` → `HTTP/2 200` with valid cert
(cert issuance can take a few minutes).

## 8. CI: deploy on push + daily rebuild — agent

`.github/workflows/deploy.yml`:

```yaml
name: deploy
on:
  push: { branches: [main] }
  schedule: [{ cron: "23 5 * * *" }]   # daily rebuild → fresh Substack card
  workflow_dispatch: {}
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm ci && npm run build
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy dist --project-name <PROJECT>
```

```bash
gh secret set CLOUDFLARE_API_TOKEN
gh secret set CLOUDFLARE_ACCOUNT_ID
```

**Verify:** `gh workflow run deploy && gh run watch` → green; site updated.

## 9. Launch checks — agent

```bash
curl -sI https://<DOMAIN> | head -5          # 200, cf headers
npx broken-link-checker https://<DOMAIN> -ro # no dead links
npx lighthouse https://<DOMAIN> --preset=perf --quiet  # scores ≥ 95 (PRD budget)
```

Plus manual: OG preview (opengraph.xyz), mobile pass at 375 px,
`prefers-reduced-motion` pass (DevTools → Rendering).

## 10. Post-launch — human

- Update LinkedIn/GitHub/Twitter bios with `<DOMAIN>`.
- Point Substack "website" field at it.
- Optional later: Cloudflare Web Analytics toggle (dash, one click);
  ENS `wschwab.eth` → IPFS mirror (deferred, see PRD non-goals).

## Human-required summary

Step 3 (credentials, once), step 6 (payment), step 10 (bios).
Everything else is fully agent-executable.
