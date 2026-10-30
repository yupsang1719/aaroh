import { z } from 'zod';

/**
 * Content shapes returned by GET /api/settings and /api/releases.
 * Every ContentProvider (Mongo now, a headless CMS later) must produce exactly these,
 * so the client never needs to know where content comes from.
 */

// Site-relative ("/placeholder/x.svg") or absolute ("https://cdn…") URL.
const assetUrl = z.string().trim().min(1);
const httpUrl = z.url({ protocol: /^https?$/ });

/** Optional field where a blank string or null (common in CMS data) means "not set". */
const blankable = <T extends z.ZodType>(schema: T) =>
  z.preprocess((v) => (v === '' || v === null ? undefined : v), schema.optional());

export const imageSchema = z.object({
  url: assetUrl,
  alt: z.string().trim(),
  caption: blankable(z.string().trim()),
});

export const creditSchema = z.object({
  role: z.string().trim().min(1),
  name: z.string().trim().min(1),
});

export const streamingLinksSchema = z.object({
  spotify: blankable(httpUrl),
  appleMusic: blankable(httpUrl),
  youtubeMusic: blankable(httpUrl),
  other: z.array(z.object({ label: z.string().trim().min(1), url: httpUrl })).default([]),
});

export const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase words separated by hyphens');

export const releaseSchema = z.object({
  title: z.string().trim().min(1),
  slug: slugSchema,
  artist: z.string().trim().min(1),
  // Calendar date, "YYYY-MM-DD". Kept as a plain date so it never shifts with time zones.
  releaseDate: z.iso.date(),
  summary: z.string().trim(),
  // Plain text; blank lines separate paragraphs.
  story: z.string().trim(),
  youtubeId: z
    .string()
    .regex(/^[A-Za-z0-9_-]{11}$/, 'YouTube ID is the 11-character code from the video URL'),
  streamingLinks: streamingLinksSchema.default({ other: [] }),
  coverImage: imageSchema,
  stills: z.array(imageSchema).default([]),
  credits: z.array(creditSchema).default([]),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  order: z.number().int().default(0),
});

export const releaseSummarySchema = releaseSchema.pick({
  title: true,
  slug: true,
  artist: true,
  releaseDate: true,
  summary: true,
  youtubeId: true,
  coverImage: true,
  featured: true,
});

export const releaseLinkSchema = z.object({ slug: z.string(), title: z.string() });

export const releaseDetailSchema = releaseSchema.extend({
  previous: releaseLinkSchema.nullable(),
  next: releaseLinkSchema.nullable(),
});

export const teamMemberSchema = z.object({
  name: z.string().trim().min(1),
  role: z.string().trim().min(1),
  photoUrl: blankable(assetUrl),
});

export const processStepSchema = z.object({
  title: z.string().trim().min(1),
  text: z.string().trim(),
  imageUrl: blankable(assetUrl),
  imageAlt: blankable(z.string().trim()),
});

export const siteSettingsSchema = z.object({
  companyName: z.string().trim().min(1).default('Aaroh'),
  tagline: z.string().trim(),
  hero: z.object({
    mode: z.enum(['collage', 'video']).default('collage'),
    videoUrl: blankable(assetUrl),
    posterUrl: blankable(assetUrl),
    collageImages: z.array(imageSchema).default([]),
  }),
  about: z.object({
    intro: z.string().trim(),
    story: z.string().trim(),
    location: z.string().trim(),
  }),
  team: z.array(teamMemberSchema).default([]),
  processSteps: z.array(processStepSchema).default([]),
  contactEmail: z.email(),
  socials: z
    .object({
      instagram: blankable(httpUrl),
      youtube: blankable(httpUrl),
      tiktok: blankable(httpUrl),
      spotify: blankable(httpUrl),
    })
    .default({}),
});

export type Image = z.infer<typeof imageSchema>;
export type Credit = z.infer<typeof creditSchema>;
export type StreamingLinks = z.infer<typeof streamingLinksSchema>;
export type Release = z.infer<typeof releaseSchema>;
export type ReleaseSummary = z.infer<typeof releaseSummarySchema>;
export type ReleaseLink = z.infer<typeof releaseLinkSchema>;
export type ReleaseDetail = z.infer<typeof releaseDetailSchema>;
export type TeamMember = z.infer<typeof teamMemberSchema>;
export type ProcessStep = z.infer<typeof processStepSchema>;
export type SiteSettings = z.infer<typeof siteSettingsSchema>;
