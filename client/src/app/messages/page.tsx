import { MessagesPage } from "@/features/messages/components/MessagesPage";
import { Suspense } from "react";
export default function Messages() { return <Suspense fallback={<main className="mx-auto max-w-5xl px-4 py-6"><div className="h-96 animate-pulse rounded-xl bg-slate-100" /></main>}><MessagesPage /></Suspense>; }
