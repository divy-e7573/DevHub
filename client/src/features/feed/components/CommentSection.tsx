"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { getApiErrorMessage } from "@/services/auth.service";
import { createComment, getComments } from "@/services/post.service";
import type { FeedComment } from "@/types/post";

export function CommentSection({ postId, onAdded }: { postId: string; onAdded(): void }) {
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { let active = true; getComments(postId).then((page) => { if (active) setComments(page.items); }).catch((requestError: unknown) => { if (active) setError(getApiErrorMessage(requestError)); }).finally(() => { if (active) setIsLoading(false); }); return () => { active = false; }; }, [postId]);
  async function submit(event: React.FormEvent<HTMLFormElement>): Promise<void> { event.preventDefault(); if (!content.trim()) return; setIsSubmitting(true); setError(null); try { const comment = await createComment(postId, content.trim()); setComments((current) => [comment, ...current]); setContent(""); onAdded(); } catch (requestError) { setError(getApiErrorMessage(requestError)); } finally { setIsSubmitting(false); } }
  return <section className="mt-4 border-t border-slate-100 pt-4"><form onSubmit={submit} className="flex gap-2"><label className="sr-only" htmlFor={`comment-${postId}`}>Add a comment</label><input id={`comment-${postId}`} value={content} onChange={(event) => setContent(event.target.value)} maxLength={2000} className="h-10 min-w-0 flex-1 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" placeholder="Write a comment..." /><Button className="w-auto" type="submit" disabled={isSubmitting}>{isSubmitting ? "Posting..." : "Comment"}</Button></form>{error ? <p className="mt-2 text-sm text-red-600" role="alert">{error}</p> : null}<div className="mt-4 space-y-4">{isLoading ? <p className="text-sm text-slate-500">Loading comments...</p> : null}{!isLoading && !comments.length ? <p className="text-sm text-slate-500">Be the first to comment.</p> : null}{comments.map((comment) => <article key={comment.id} className="flex gap-3"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-800">{comment.author.name.charAt(0)}</div><div className="min-w-0 rounded-lg bg-slate-50 px-3 py-2"><Link className="text-sm font-semibold text-slate-900 hover:underline" href={`/${comment.author.username}`}>{comment.author.name}</Link><p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{comment.content}</p></div></article>)}</div></section>;
}
