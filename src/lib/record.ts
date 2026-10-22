import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';

/** The superseded v4 design, frozen at the CID its last publish pinned
 *  (IPNS key `wschwab-site`). Subdomain gateway so its root-relative paths resolve. */
export const ARCHIVE_V4 = {
  cid: 'bafybeidalkweqt4t54jpwk4i2ngsajv52fqn5fw4qobwdo6wv4gduxlwli',
  url: 'https://bafybeidalkweqt4t54jpwk4i2ngsajv52fqn5fw4qobwdo6wv4gduxlwli.ipfs.dweb.link/',
};

/** Exhibit numbers are fixed by landing order, then id, so Exhibit 3 is
 *  Exhibit 3 on every page that shows it. */
export function exhibitOrder<T extends { id: string; data: { featured?: number } }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => (a.data.featured ?? 99) - (b.data.featured ?? 99) || a.id.localeCompare(b.id),
  );
}

/** The caption's `)` column: more rows than any caption needs; CSS clips it to the caption's height. */
export const PARENS = ')\n'.repeat(12);

// ── Line addresses ──────────────────────────────────────────────────────────
// A line's anchor is derived from its own words, never from its position, so a
// citation (#L-3f9a1c) survives any edit that does not touch the cited text.
// The numeral in the rail is the readable coordinate; the anchor is the address.

const text = (html: string) =>
  html.replace(/<[^>]*>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim();

export function lineId(html: string): string {
  return 'L-' + createHash('sha256').update(text(html)).digest('hex').slice(0, 6);
}

const VOID: Record<string, true> = { br: true, hr: true, img: true, input: true, meta: true, link: true, source: true, wbr: true };

/** Split rendered markdown into its top-level blocks. Astro's markdown output
 *  is well-formed, so a depth counter over tags is sufficient. */
export function topLevelBlocks(html: string): string[] {
  const blocks: string[] = [];
  const tag = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)[^>]*?(\/?)>/g;
  let depth = 0;
  let start = -1;
  for (let m; (m = tag.exec(html)); ) {
    const [whole, close, name, selfClose] = m;
    if (VOID[name.toLowerCase()] || selfClose) {
      if (depth === 0) blocks.push(whole);
      continue;
    }
    if (!close) {
      if (depth === 0) start = m.index;
      depth++;
    } else if (--depth === 0) {
      blocks.push(html.slice(start, m.index + whole.length));
    }
  }
  return blocks.filter((b) => text(b).length > 0);
}

/** Blocks paired with collision-free addresses (a repeated block gets -2, -3…). */
export function addressedBlocks(html: string): { id: string; html: string }[] {
  const seen = new Map<string, number>();
  return topLevelBlocks(html).map((block) => {
    const base = lineId(block);
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    return { id: n === 1 ? base : `${base}-${n}`, html: block };
  });
}

// ── Edition stamp ───────────────────────────────────────────────────────────
// Which commit this build is a record of. Bound to git at build time; an
// uncommitted build says so instead of borrowing the last commit's name.

function git(cmd: string): string {
  try {
    return execSync(`git ${cmd}`, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return '';
  }
}

const sha = git('rev-parse HEAD');
const dirty = sha !== '' && git('status --porcelain --untracked-files=no') !== '';
// A clean build is closed when its commit was; CI's daily rebuild of the same
// commit must not move the date. A dirty build has no commit, so it is closed now.
const committed = sha && !dirty ? git('log -1 --format=%cI') : '';
export const EDITION = {
  short: sha.slice(0, 7),
  sha,
  dirty,
  closed: committed ? new Date(committed) : new Date(),
};
