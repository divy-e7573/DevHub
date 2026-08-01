import { z } from "zod";

export const createPostFormSchema = z.object({
  content: z.string().trim().max(5000, "Posts cannot exceed 5000 characters."),
});

export type CreatePostFormValues = z.infer<typeof createPostFormSchema>;
