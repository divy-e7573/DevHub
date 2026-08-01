export interface PostAuthor {
  id: string;
  name: string;
  username: string;
}

export interface FeedPost {
  id: string;
  author: PostAuthor;
  content: string;
  mediaUrls: string[];
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FeedComment {
  id: string;
  author: PostAuthor;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CursorPage<T> {
  items: T[];
  pageInfo: { endCursor: string | null; hasNextPage: boolean };
}
