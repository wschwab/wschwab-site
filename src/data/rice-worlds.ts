/* Which /rice/ worlds are published.
 *
 * The deck exists in three visual worlds that share ONE copy of the markup
 * (RiceDeck.astro); they differ only by stylesheet. All three are finished and
 * kept in the repo — this switch controls which ones get a public URL.
 *
 * TO PUBLISH ANOTHER WORLD: flip its `published` to true, run `npm run build`,
 * and ship. Nothing else needs editing; the page files already exist.
 *
 * Publishing is permanent here (Cloudflare + IPFS pin + Radicle mirror), so a
 * world that is not ready simply stays false rather than shipping and being
 * pulled later.
 */
export type World = {
  slug: 'site' | 'riso' | 'scope';
  /** route under /rice/ ; the empty slug is /rice/ itself */
  path: string;
  label: string;
  published: boolean;
};

export const WORLDS: World[] = [
  { slug: 'riso',  path: '/rice/',       label: 'risograph zine', published: true  },
  { slug: 'site',  path: '/rice/site/',  label: 'site-native',    published: false },
  { slug: 'scope', path: '/rice/scope/', label: 'oscilloscope',   published: false },
];

export const isPublished = (slug: World['slug']) =>
  WORLDS.some((w) => w.slug === slug && w.published);
