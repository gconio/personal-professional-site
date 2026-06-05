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
    theme: z.string().optional(),
    sourceStatus: z.string().optional(),
    license: z.string().optional(),
    tags: z.array(z.string()).default([]),
    isbnPrint: z.string().optional(),
    isbnEbook: z.string().optional(),
    cover: z.string().optional(),
    formatsImage: z.string().optional(),
    previewIndexPdf: z.string().optional(),
    previewSamplePdf: z.string().optional(),
    link: z.string().optional(),
    pdfUrl: z.string().optional(),
    featured: z.boolean().default(false),
    order: z.number().default(99)
  })
});

const commentiManuale = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/commenti-manuale' }),
  schema: z.object({
    name: z.string(),
    role: z.string().optional().default(''),
    date: z.coerce.date(),
    published: z.boolean().default(true),
    featured: z.boolean().default(false),
    source: z.string().optional().default('Modulo commenti Manuale'),
    consent: z.boolean().default(true)
  })
});


const risorsa = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/risorse' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    type: z.string(),
    author: z.string().optional().default(''),
    institution: z.string().optional().default(''),
    year: z.number().optional(),
    category: z.string(),
    level: z.string(),
    language: z.string(),
    link: z.string().url().optional(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    order: z.number().default(99)
  })
});

const media = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/media' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    type: z.string(),
    format: z.string(),
    category: z.string(),
    source: z.string().optional().default(''),
    sourceLabel: z.string().optional().default(''),
    thumbnail: z.string().optional().default(''),
    duration: z.string().optional().default(''),
    youtubeId: z.string().optional(),
    externalUrl: z.string().url().optional(),
    pdfUrl: z.string().optional(),
    publicationUrl: z.string().optional(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    order: z.number().default(99)
  })
});

export const collections = { corso, progetto, pubblicazione, commentiManuale, risorsa, media };
