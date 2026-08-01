import { z } from "zod";

export const userIdParamSchema = z
  .object({ id: z.string().regex(/^[a-f\d]{24}$/i, "Must be a valid user identifier.") })
  .strict();

export const followCursorSchema = z
  .object({ cursor: z.string().min(1).optional(), limit: z.coerce.number().int().min(1).max(50).default(20) })
  .strict();

export type FollowCursorInput = z.infer<typeof followCursorSchema>;
