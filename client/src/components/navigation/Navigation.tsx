import Link from "next/link";
import { SearchBar } from "./SearchBar";

export function Navigation() {
  return <header className="border-b border-slate-200 bg-white"><nav className="mx-auto flex max-w-5xl items-center gap-5 px-4 py-3"><Link href="/" className="shrink-0 text-lg font-bold text-slate-950">DevHub</Link><SearchBar /></nav></header>;
}
