import { z } from "zod";

export const syncGitHubSchema = z
  .object({
    username: z.string().trim().min(1).max(39).regex(/^[a-zA-Z\d](?:[a-zA-Z\d-]{0,37}[a-zA-Z\d])?$/, "GitHub username is invalid."),
  })
  .strict();

export type SyncGitHubInput = z.infer<typeof syncGitHubSchema>;
