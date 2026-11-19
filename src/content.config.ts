import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Every artwork is one .md file in src/content/artworks/<category>/.
// The folder decides the category (see src/data/categories.ts).

const artworks = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/artworks' }),
  schema: ({ image }) => {
    const credit = z.object({
      name: z.string().min(1),
      // Instagram handle without the @
      instagram: z
        .string()
        .regex(/^[A-Za-z0-9._]{1,30}$/, 'Instagram handle: letters, numbers, . and _ only, no @')
        .optional(),
      url: z.url().optional(),
    });

    const photo = z.object({
      src: image(),
      alt: z.string().optional(),
      credit: credit.optional(),
      // true = we haven't got the photographer's OK yet. Shown on preview builds only,
      // hidden on the live site (see src/data/site.ts).
      permissionPending: z.boolean().default(false),
    });

    return z.object({
      // Art boxes use their location as the title.
      title: z.string().min(1),
      // Cross streets / address, for pieces that have a real title.
      location: z.string().optional(),
      artist: z.string().optional(),
      sponsor: z.string().optional(),
      description: z.string().default(''),
      lat: z.number().min(37.0).max(37.6),
      lng: z.number().min(-122.2).max(-121.5),
      district: z.number().int().min(1).max(10).optional(),
      neighborhood: z.string().optional(),
      // "removed" pieces stay in the data but are hidden from the map.
      status: z.enum(['active', 'removed']).default('active'),
      featured: photo.optional(),
      photos: z.array(photo).default([]),
    });
  },
});

export const collections = { artworks };
