import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const priceSchema = z.object({
  original: z.number(),
  discount: z.number(),
});

const courseItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  prices: z
    .object({
      online: priceSchema.optional(),
      offline: priceSchema.optional(),
    })
    .optional(),
  popular: z.boolean(),
  categories: z.array(z.string()),
  image: z.string(),
  url: z.string().optional(),
  duration: z.string(),
  highlights: z.array(z.string()),
  modes: z.array(z.enum(["online", "offline"])),
});

const courses = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/courses" }),
  schema: z.object({
    courseSlug: z.string(),
    type: z.enum(["about-course", "about-exam", "notification"]),
    title: z.string().optional(),
    badge: z.string().optional(),
    description: z.string().optional(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    seoKeywords: z.string().optional(),
    ogImage: z.string().optional(),
    highlightWord: z.string().optional(),
    heroHeading: z.string().optional(),
    price: z.string().optional(),
    pricePeriod: z.string().optional(),
    features: z.array(z.string()).optional(),
    // Course listing metadata (only on about-course)
    courses: z.array(courseItemSchema).optional(),
  }),
});
export type Course = z.infer<typeof courseItemSchema>;
export type CourseCollection = z.infer<typeof courses>;
export const collections = { courses };
