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
  schema: z.object({
    title: z.string(),
    date: z.date(),
  }),
});

export const collections = {
  projects,
  blog,
};
