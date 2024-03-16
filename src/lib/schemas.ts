import { z } from "astro/zod";

export const GuestbookForm = z.object({
  message: z.string().min(1).max(100),
});

export type GuestbookForm = z.infer<typeof GuestbookForm>;
