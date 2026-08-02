"use client";

import { Github, Star } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { getApiErrorMessage } from "@/services/auth.service";
import { syncGitHubProfile } from "@/services/profile.service";
import type { Profile } from "@/types/profile";

export function GitHubShowcase({ profile, canEdit, onSynced }: { profile: Profile; canEdit: boolean; onSynced(profile: Profile): void }) {
  const [username, setUsername] = useState(profile.github?.username ?? "");
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function sync(): Promise<void> { if (!username.trim()) { setError("Enter a GitHub username."); return; } setError(null); setIsSyncing(true); try { onSynced(await syncGitHubProfile(username.trim())); } catch (requestError) { setError(getApiErrorMessage(requestError)); } finally { setIsSyncing(false); } }
  const github = profile.github;
  return <section>{canEdit ? <div className="mb-6 flex flex-col gap-2 sm:flex-row"><input value={username} onChange={(event) => setUsername(event.target.value)} maxLength={39} className="h-10 flex-1 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" placeholder="GitHub username" /><Button type="button" className="w-auto gap-2" onClick={sync} disabled={isSyncing}><Github size={17} />{isSyncing ? "Syncing..." : github ? "Sync again" : "Sync GitHub"}</Button></div> : null}{error ? <p className="mb-4 text-sm text-red-600" role="alert">{error}</p> : null}{github ? <><div className="flex flex-wrap items-center gap-x-6 gap-y-2"><a href={github.profileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-semibold text-slate-950 hover:underline"><Github size={20} />{github.username}</a><span className="text-sm text-slate-600">{github.publicReposCount} public repos</span><span className="inline-flex items-center gap-1 text-sm text-slate-600"><Star size={15} />{github.totalStars} stars</span><span className="text-xs text-slate-500">Synced {new Date(github.syncedAt).toLocaleDateString()}</span></div><h3 className="mt-6 font-semibold text-slate-950">Top languages</h3><div className="mt-3 flex flex-wrap gap-2">{github.topLanguages.map((language) => <span key={language.name} className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-800">{language.name}</span>) || <p className="text-sm text-slate-500">No language data available.</p>}</div><div className="mt-6 grid gap-3 sm:grid-cols-2">{github.repositories.map((repository) => <a key={repository.url} href={repository.url} target="_blank" rel="noreferrer" className="rounded-lg border border-slate-200 p-4 hover:border-indigo-300"><h4 className="font-semibold text-slate-950">{repository.name}</h4>{repository.description ? <p className="mt-1 line-clamp-2 text-sm text-slate-600">{repository.description}</p> : null}<p className="mt-3 text-xs text-slate-500">{repository.language ?? "Other"} · {repository.stars} stars</p></a>)}</div></> : <p className="text-sm text-slate-500">No GitHub profile has been synced yet.</p>}</section>;
}
