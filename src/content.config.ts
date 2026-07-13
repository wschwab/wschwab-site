import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const work = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/work' }),
  schema: z.object({
    title: z.string(),
    role: z.string(),
    period: z.string(),
    tags: z.array(z.string()),
    soft_tags: z.array(z.string()).default([]), // rendered dashed/muted (.warn)
    summary: z.string(),
    featured: z.number().int().min(1).max(6).optional(), // landing slot order
    cta: z.string().default('read case study →'),
    external: z.string().url().optional(), // card links out instead of /work/<slug>/
    links: z.array(z.object({ label: z.string(), url: z.string().url() })).default([]),
    draft: z.boolean().default(false),
  }),
});

const writing = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/writing' }),
  schema: z.object({
    title: z.string(),
    kind: z.string(), // eyebrow label, e.g. "Technical · Medium"
    venue: z.enum(['Medium', 'Mirror', 'Paragraph', 'Substack', 'local']),
    url: z.string().url().optional(), // absent only for venue: local
    date: z.coerce.date().optional(),
    summary: z.string(),
    featured: z.number().int().min(1).max(3).optional(), // landing slot order
    archive_section: z.enum(['main', 'older']).default('main'),
    draft: z.boolean().default(false),
  }),
});

export const collections = { work, writing };
