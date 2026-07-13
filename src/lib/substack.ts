export interface SubstackPost {
  title: string;
  url: string;
  date: string; // e.g. "Jul 2026"
  summary: string;
}

const FALLBACK: SubstackPost = {
  title: 'Latest Essay',
  url: 'https://wschwab.substack.com',
  date: '',
  summary: 'Posting thoughts at wschwab.substack.com — this card always shows the newest post.',
};

function tag(xml: string, name: string): string {
  const m = xml.match(new RegExp(`<${name}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${name}>`));
  return m ? m[1].trim() : '';
}

/** Build-time fetch of the newest Substack post; falls back to a static card
 *  so the site still builds offline (PRD acceptance criterion 3). */
export async function latestSubstackPost(): Promise<SubstackPost> {
  try {
    const res = await fetch('https://wschwab.substack.com/feed', {
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return FALLBACK;
    const xml = await res.text();
    const item = xml.match(/<item>([\s\S]*?)<\/item>/)?.[1];
    if (!item) return FALLBACK;
    const title = tag(item, 'title');
    const url = tag(item, 'link');
    if (!title || !url) return FALLBACK;
    const words = tag(item, 'description').replace(/<[^>]*>/g, '').split(/\s+/);
    const summary = words.slice(0, 30).join(' ') + (words.length > 30 ? '…' : '');
    const pub = tag(item, 'pubDate');
    const date = pub
      ? new Date(pub).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      : '';
    return { title, url, date, summary };
  } catch {
    return FALLBACK;
  }
}
