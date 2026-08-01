"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FollowButton } from "@/features/follow/components/FollowButton";
import { PostCard } from "@/features/feed/components/PostCard";
import { getApiErrorMessage } from "@/services/auth.service";
import { search } from "@/services/search.service";
import type { SearchResponse, SearchType } from "@/types/search";

const tabs: Array<{ id: SearchType; label: string }> = [{ id: "users", label: "People" }, { id: "posts", label: "Posts" }, { id: "skills", label: "Skills" }];

export function SearchResults() {
  const params = useSearchParams();
  const query = params.get("q")?.trim() ?? "";
  const requestedType = params.get("type");
  const type: SearchType = requestedType === "posts" || requestedType === "skills" ? requestedType : "users";
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => { if (query.length < 2) { setResult(null); return; } let active = true; setIsLoading(true); setError(null); search(query, type).then((response) => { if (active) setResult(response); }).catch((requestError: unknown) => { if (active) setError(getApiErrorMessage(requestError)); }).finally(() => { if (active) setIsLoading(false); }); return () => { active = false; }; }, [query, type]);
  return <main className="mx-auto max-w-2xl px-4 py-8"><h1 className="text-2xl font-bold text-slate-950">Search</h1><p className="mt-1 text-sm text-slate-600">{query ? `Results for “${query}”` : "Search developers, posts, and skills."}</p><div className="mt-5 flex border-b border-slate-200">{tabs.map((tab) => <Link key={tab.id} href={`/search?q=${encodeURIComponent(query)}&type=${tab.id}`} className={`border-b-2 px-4 py-3 text-sm font-medium ${type === tab.id ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500"}`}>{tab.label}</Link>)}</div>{isLoading ? <p className="mt-6 text-sm text-slate-500">Searching...</p> : null}{error ? <p className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-800" role="alert">{error}</p> : null}{result?.type === "users" ? <ul className="mt-5 space-y-3">{result.results.map((user) => <li key={user.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4"><Link href={`/${user.username}`} className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-800">{user.name.charAt(0)}</span><span><span className="block font-semibold text-slate-950">{user.name}</span><span className="text-sm text-slate-500">@{user.username}</span></span></Link><FollowButton userId={user.id} initialIsFollowing={user.isFollowing} onChanged={() => undefined} /></li>)}</ul> : null}{result?.type === "posts" ? <div className="mt-5 space-y-4">{result.results.map((post) => <PostCard key={post.id} post={post} />)}</div> : null}{result?.type === "skills" ? <ul className="mt-5 space-y-3">{result.results.map((entry) => <li key={entry.user.id} className="rounded-xl border border-slate-200 bg-white p-4"><Link href={`/${entry.user.username}`} className="font-semibold text-slate-950 hover:underline">{entry.user.name}</Link><p className="text-sm text-slate-500">@{entry.user.username}</p><div className="mt-3 flex flex-wrap gap-2">{entry.skills.map((skill) => <span key={skill} className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-800">{skill}</span>)}</div></li>)}</ul> : null}{result && !result.results.length ? <p className="mt-6 text-sm text-slate-500">No matching {type} found.</p> : null}</main>;
}
