import { defineCollection, z } from "astro:content";

const projects = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      blurb: z.string(),
      url: z.union([z.string().url(), z.string().startsWith("/")]),
      repo: z.string().url(),
      image: image(),
      order: z.number(),
    }),
});

const blog = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      tags: z.array(z.string()),
      image: z.object({
        src: image(),
        caption: z.string().optional(),
      }),
      isPublished: z.boolean(),
    }),
});

export const collections = {
  projects,
  blog,
};
