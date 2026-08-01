"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CreatePostBox } from "./CreatePostBox";
import { PostCard } from "./PostCard";
import { Button } from "@/components/ui/Button";
import { appendFeed, prependPost, setFeed } from "@/features/feed/feedSlice";
import { getApiErrorMessage } from "@/services/auth.service";
import { getFeed } from "@/services/post.service";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export function FeedPage() {
  const dispatch = useAppDispatch();
  const { posts, endCursor, hasNextPage } = useAppSelector((state) => state.feed);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { let active = true; getFeed().then((page) => { if (active) dispatch(setFeed(page)); }).catch((requestError: unknown) => { if (active) setError(getApiErrorMessage(requestError)); }).finally(() => { if (active) setIsLoading(false); }); return () => { active = false; }; }, [dispatch]);
  async function loadMore(): Promise<void> { if (!endCursor) return; setIsLoadingMore(true); try { dispatch(appendFeed(await getFeed(endCursor))); } catch (requestError) { setError(getApiErrorMessage(requestError)); } finally { setIsLoadingMore(false); } }
  return <main className="mx-auto max-w-2xl space-y-5 px-4 py-8"><header><h1 className="text-2xl font-bold text-slate-950">Developer feed</h1><p className="mt-1 text-sm text-slate-600">Ideas, projects, and conversations from the community.</p></header>{isAuthenticated ? <CreatePostBox onCreated={(post) => dispatch(prependPost(post))} /> : <section className="rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-950"><Link className="font-semibold underline" href="/login">Sign in</Link> to share updates, like posts, and join the conversation.</section>}{error ? <p className="rounded-lg bg-red-50 p-4 text-sm text-red-800" role="alert">{error}</p> : null}{isLoading ? <div className="space-y-4">{[1, 2, 3].map((item) => <div key={item} className="h-52 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />)}</div> : null}{!isLoading && !posts.length ? <section className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">No posts yet. Start the conversation.</section> : null}{posts.map((post) => <PostCard key={post.id} post={post} />)}{hasNextPage ? <Button className="mx-auto w-auto" type="button" onClick={loadMore} disabled={isLoadingMore}>{isLoadingMore ? "Loading..." : "Load more"}</Button> : null}</main>;
}
