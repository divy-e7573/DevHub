"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, X } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { createPostFormSchema, type CreatePostFormValues } from "@/schemas/post.schema";
import { getApiErrorMessage } from "@/services/auth.service";
import { createPost } from "@/services/post.service";
import type { FeedPost } from "@/types/post";

export function CreatePostBox({ onCreated }: { onCreated(post: FeedPost): void }) {
  const [images, setImages] = useState<File[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const form = useForm<CreatePostFormValues>({ resolver: zodResolver(createPostFormSchema), defaultValues: { content: "" } });

  function selectImages(event: React.ChangeEvent<HTMLInputElement>): void {
    const selected = Array.from(event.target.files ?? []);
    if (images.length + selected.length > 4) { setFormError("You can attach up to four images."); return; }
    if (selected.some((file) => !["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024)) {
      setFormError("Images must be JPEG, PNG, or WebP and no larger than 5 MB.");
      return;
    }
    setFormError(null);
    setImages((current) => [...current, ...selected]);
    event.target.value = "";
  }

  async function submit(values: CreatePostFormValues): Promise<void> {
    setFormError(null);
    if (!values.content && !images.length) { setFormError("Write something or attach an image."); return; }
    try {
      const post = await createPost(values.content, images);
      form.reset(); setImages([]); onCreated(post);
    } catch (error) { setFormError(getApiErrorMessage(error)); }
  }

  return <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
    <form onSubmit={form.handleSubmit(submit)} noValidate className="space-y-3">
      {formError ? <p className="rounded-md bg-red-50 p-3 text-sm text-red-800" role="alert">{formError}</p> : null}
      <label className="sr-only" htmlFor="post-content">Share an update</label>
      <textarea id="post-content" className="min-h-28 w-full resize-y rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" placeholder="Share an update with the developer community..." {...form.register("content")} />
      <div className="flex flex-wrap gap-2">{images.map((image, index) => <span key={`${image.name}-${index}`} className="inline-flex max-w-full items-center gap-1 rounded-full bg-slate-100 py-1 pl-3 pr-1 text-xs text-slate-700">{image.name}<button type="button" aria-label={`Remove ${image.name}`} className="rounded-full p-1 hover:bg-slate-200" onClick={() => setImages((current) => current.filter((_, itemIndex) => itemIndex !== index))}><X size={14} /></button></span>)}</div>
      <div className="flex items-center justify-between border-t border-slate-100 pt-3"><input ref={fileInput} id="post-images" className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={selectImages} /><Button className="w-auto gap-2 bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50" type="button" onClick={() => fileInput.current?.click()}><ImagePlus size={17} /> Image</Button><Button className="w-auto" type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Posting..." : "Post"}</Button></div>
    </form>
  </section>;
}
