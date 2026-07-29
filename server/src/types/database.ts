import type { Types } from "mongoose";

/** The identifier type used for document references inside the persistence layer. */
export type ObjectIdReference = Types.ObjectId;

/** Fields supplied by Mongoose when a persistent schema enables timestamps. */
export interface TimestampedEntity {
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/** Reserved contract for models that later support recoverable deletion. */
export interface SoftDeletableEntity {
  readonly deletedAt: Date | null;
}

/** Validated cursor-pagination input shared by future list services. */
export interface CursorPaginationInput {
  cursor?: string;
  limit: number;
}

/** Cursor-pagination metadata returned by future collection endpoints. */
export interface CursorPageInfo {
  endCursor: string | null;
  hasNextPage: boolean;
}

/** Generic collection page contract for future API response types. */
export interface CursorPage<TItem> {
  items: TItem[];
  pageInfo: CursorPageInfo;
}
