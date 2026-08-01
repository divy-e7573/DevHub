"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { getApiErrorMessage } from "@/services/auth.service";
import { getFollowList } from "@/services/follow.service";
import type { FollowUser } from "@/types/follow";

export function FollowListModal({ userId, kind, onClose }: { userId: string; kind: "followers" | "following"; onClose(): void }) {
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { getFollowList(userId, kind).then((page) => setUsers(page.items)).catch((requestError: unknown) => setError(getApiErrorMessage(requestError))); }, [kind, userId]);
  return <div className="fixed inset-0 z-50 bg-slate-950/50 p-4"><section className="mx-auto mt-24 w-full max-w-md rounded-xl bg-white p-5 shadow-xl" role="dialog" aria-modal="true" aria-labelledby="follow-list-title"><div className="flex items-center justify-between"><h2 id="follow-list-title" className="text-lg font-semibold capitalize text-slate-950">{kind}</h2><button type="button" aria-label="Close" onClick={onClose} className="rounded p-1 hover:bg-slate-100"><X size={20} /></button></div>{error ? <p className="mt-4 text-sm text-red-600" role="alert">{error}</p> : null}<ul className="mt-4 space-y-3">{users.map((user) => <li key={user.id}><Link href={`/${user.username}`} onClick={onClose} className="flex items-center gap-3 rounded-lg p-2 hover:bg-slate-50"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-800">{user.name.charAt(0)}</span><span><span className="block text-sm font-semibold text-slate-950">{user.name}</span><span className="block text-xs text-slate-500">@{user.username}</span></span></Link></li>)}</ul>{!error && !users.length ? <p className="mt-4 text-sm text-slate-500">No {kind} yet.</p> : null}</section></div>;
}
