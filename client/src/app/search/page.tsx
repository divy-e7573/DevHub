import { SearchResults } from "@/features/search/components/SearchResults";
import { Suspense } from "react";

export default function SearchPage() {
  return <Suspense fallback={<main className="mx-auto max-w-2xl px-4 py-8"><div className="h-48 animate-pulse rounded-xl bg-slate-100" /></main>}><SearchResults /></Suspense>;
}
