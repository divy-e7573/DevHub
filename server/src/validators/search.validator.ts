import { z } from "zod";

export const searchTypes = ["users", "posts", "skills"] as const;
export type SearchType = (typeof searchTypes)[number];

export const searchQuerySchema = z
  .object({
    q: z.string().trim().min(2, "Search queries must contain at least 2 characters.").max(100),
    type: z.enum(searchTypes),
    limit: z.coerce.number().int().min(1).max(30).default(20),
  })
  .strict();

export type SearchQueryInput = z.infer<typeof searchQuerySchema>;
