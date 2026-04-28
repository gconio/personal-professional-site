import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const corso = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/corsi' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    level: z.string(),
    duration: z.string(),
    format: z.string(),
    audience: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    order: z.number().default(99)
  })
});

const progetto = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/progetti' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    status: z.string(),
    category: z.string(),
    featured: z.boolean().default(false),
    order: z.number().default(99)
  })
});

const pubblicazione = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pubblicazioni' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    year: z.number(),
    type: z.string(),
    publisher: z.string().optional(),
    isbnPrint: z.string().optional(),
    isbnEbook: z.string().optional(),
    cover: z.string().optional(),
    formatsImage: z.string().optional(),
    link: z.string().optional(),
    featured: z.boolean().default(false),
    order: z.number().default(99)
  })
});

const analisi = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/analisi' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    category: z.string(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false)
  })
});

export const collections = { corso, progetto, pubblicazione, analisi };
