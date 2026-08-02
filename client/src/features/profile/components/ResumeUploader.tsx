"use client";

import { FileText, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { getApiErrorMessage } from "@/services/auth.service";
import { uploadResume } from "@/services/profile.service";
import type { Profile } from "@/types/profile";

export function ResumeUploader({ onUploaded }: { onUploaded(profile: Profile): void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  async function submit(file: File | undefined): Promise<void> { if (!file) return; if (file.type !== "application/pdf" || file.size > 5 * 1024 * 1024) { setError("Choose a PDF no larger than 5 MB."); return; } setError(null); setProgress(0); try { onUploaded(await uploadResume(file, setProgress)); } catch (requestError) { setError(getApiErrorMessage(requestError)); } finally { setProgress(null); } }
  return <section className="mt-6 rounded-lg border border-dashed border-slate-300 p-4"><input ref={inputRef} className="sr-only" type="file" accept="application/pdf" onChange={(event) => submit(event.target.files?.[0])} /><div onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); submit(event.dataTransfer.files[0]); }} className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="inline-flex items-center gap-2 font-medium text-slate-950"><FileText size={18} />Resume PDF</p><p className="mt-1 text-sm text-slate-500">Drop a PDF here or choose one (up to 5 MB).</p>{progress !== null ? <p className="mt-1 text-xs text-indigo-700">Uploading {progress}%</p> : null}{error ? <p className="mt-1 text-xs text-red-600" role="alert">{error}</p> : null}</div><Button type="button" className="w-auto gap-2" onClick={() => inputRef.current?.click()} disabled={progress !== null}><Upload size={16} />{progress !== null ? "Uploading" : "Upload PDF"}</Button></div></section>;
}
