"use client";

import Link from "next/link";
import { Heart, MessageCircle } from "lucide-react";
import { useState } from "react";
import { getApiErrorMessage } from "@/services/auth.service";
import { likePost, unlikePost } from "@/services/post.service";
import { incrementComments, replacePost, toggleLikeOptimistically } from "@/features/feed/feedSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { FeedPost } from "@/types/post";
import { CommentSection } from "./CommentSection";

function relativeTime(value: string): string {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

export function PostCard({ post }: { post: FeedPost }) {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);
  const [showComments, setShowComments] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isChangingLike, setIsChangingLike] = useState(false);
  async function changeLike(): Promise<void> {
    if (!currentUser) { setError("Sign in to like posts."); return; }
    const original = post;
    setError(null); setIsChangingLike(true); dispatch(toggleLikeOptimistically(post.id));
    try { dispatch(replacePost(post.isLiked ? await unlikePost(post.id) : await likePost(post.id))); }
    catch (requestError) { dispatch(replacePost(original)); setError(getApiErrorMessage(requestError)); }
    finally { setIsChangingLike(false); }
  }
  return <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><header className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-800">{post.author.name.charAt(0)}</div><div><Link href={`/${post.author.username}`} className="font-semibold text-slate-950 hover:underline">{post.author.name}</Link><p className="text-xs text-slate-500">@{post.author.username} · {relativeTime(post.createdAt)}</p></div></header>{post.content ? <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-800">{post.content}</p> : null}{post.mediaUrls.length ? <div className={`mt-4 grid gap-2 ${post.mediaUrls.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>{post.mediaUrls.map((url) => <img key={url} src={url} alt="Post attachment" className="max-h-[31.25rem] w-full rounded-lg object-cover" />)}</div> : null}<div className="mt-4 flex gap-1 border-t border-slate-100 pt-3"><button type="button" onClick={changeLike} disabled={isChangingLike} className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-100 disabled:opacity-50 ${post.isLiked ? "text-rose-600" : "text-slate-600"}`}><Heart size={18} fill={post.isLiked ? "currentColor" : "none"} />{post.likesCount}</button><button type="button" onClick={() => setShowComments((value) => !value)} className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"><MessageCircle size={18} />{post.commentsCount}</button></div>{error ? <p className="mt-2 text-sm text-red-600" role="alert">{error}</p> : null}{showComments ? <CommentSection postId={post.id} onAdded={() => dispatch(incrementComments(post.id))} /> : null}</article>;
}
