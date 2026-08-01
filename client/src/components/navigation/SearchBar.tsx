"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  useEffect(() => { const value = query.trim(); if (value.length < 2) return; const timeout = window.setTimeout(() => router.push(`/search?q=${encodeURIComponent(value)}&type=users`), 400); return () => window.clearTimeout(timeout); }, [query, router]);
  function submit(event: React.FormEvent<HTMLFormElement>): void { event.preventDefault(); const value = query.trim(); if (value.length >= 2) router.push(`/search?q=${encodeURIComponent(value)}&type=users`); }
  return <form onSubmit={submit} className="relative w-full max-w-md"><label className="sr-only" htmlFor="global-search">Search DevHub</label><Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} /><input id="global-search" value={query} onChange={(event) => setQuery(event.target.value)} className="h-9 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" placeholder="Search developers, posts, skills..." /></form>;
}
