import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CursorPage, FeedPost } from "@/types/post";

interface FeedState {
  posts: FeedPost[];
  endCursor: string | null;
  hasNextPage: boolean;
}

const initialState: FeedState = { posts: [], endCursor: null, hasNextPage: false };

const feedSlice = createSlice({
  name: "feed",
  initialState,
  reducers: {
    setFeed(state, action: PayloadAction<CursorPage<FeedPost>>) {
      state.posts = action.payload.items;
      state.endCursor = action.payload.pageInfo.endCursor;
      state.hasNextPage = action.payload.pageInfo.hasNextPage;
    },
    appendFeed(state, action: PayloadAction<CursorPage<FeedPost>>) {
      const existing = new Set(state.posts.map((post) => post.id));
      state.posts.push(...action.payload.items.filter((post) => !existing.has(post.id)));
      state.endCursor = action.payload.pageInfo.endCursor;
      state.hasNextPage = action.payload.pageInfo.hasNextPage;
    },
    prependPost(state, action: PayloadAction<FeedPost>) { state.posts.unshift(action.payload); },
    replacePost(state, action: PayloadAction<FeedPost>) {
      const index = state.posts.findIndex((post) => post.id === action.payload.id);
      if (index !== -1) state.posts[index] = action.payload;
    },
    toggleLikeOptimistically(state, action: PayloadAction<string>) {
      const post = state.posts.find((item) => item.id === action.payload);
      if (post) { post.isLiked = !post.isLiked; post.likesCount += post.isLiked ? 1 : -1; }
    },
    incrementComments(state, action: PayloadAction<string>) {
      const post = state.posts.find((item) => item.id === action.payload);
      if (post) post.commentsCount += 1;
    },
  },
});

export const { appendFeed, incrementComments, prependPost, replacePost, setFeed, toggleLikeOptimistically } = feedSlice.actions;
export const feedReducer = feedSlice.reducer;
