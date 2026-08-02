import Link from "next/link";
import { SearchBar } from "./SearchBar";
import { NotificationBell } from "@/features/notifications/components/NotificationBell";

export function Navigation() {
  return <header className="border-b border-slate-200 bg-white"><nav className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3"><Link href="/" className="shrink-0 text-lg font-bold text-slate-950">DevHub</Link><SearchBar /><Link href="/messages" className="rounded-md px-2 py-1 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950">Messages</Link><NotificationBell /></nav></header>;
}
