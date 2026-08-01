import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Must be a valid resource identifier.");

export const postIdParamSchema = z.object({ id: objectIdSchema }).strict();

export const createPostSchema = z
  .object({
    content: z.string().trim().max(5000, "Post content must not exceed 5000 characters.").default(""),
  })
  .strict();

export const createCommentSchema = z
  .object({
    content: z.string().trim().min(1, "Comment content is required.").max(2000),
  })
  .strict();

export const cursorPaginationSchema = z
  .object({
    cursor: z.string().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  })
  .strict();

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type CursorPaginationInput = z.infer<typeof cursorPaginationSchema>;
