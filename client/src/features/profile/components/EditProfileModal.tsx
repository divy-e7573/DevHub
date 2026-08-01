"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, X } from "lucide-react";
import { useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { profileFormSchema, type ProfileFormValues } from "@/schemas/profile.schema";
import { getApiErrorMessage } from "@/services/auth.service";
import { updateProfile, uploadProfileImage } from "@/services/profile.service";
import type { Profile, UpdateProfileInput } from "@/types/profile";

interface EditProfileModalProps {
  profile: Profile;
  onClose(): void;
  onSaved(profile: Profile): void;
}

const textareaClassName = "min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-950 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200";

function toFormValues(profile: Profile): ProfileFormValues {
  return {
    bio: profile.bio ?? "",
    location: profile.location ?? "",
    skills: profile.skills.join(", "),
    github: profile.socialLinks.github ?? "",
    twitter: profile.socialLinks.twitter ?? "",
    linkedin: profile.socialLinks.linkedin ?? "",
    experience: profile.experience.map((item) => ({ ...item, location: item.location ?? "", endDate: item.endDate ?? "", description: item.description ?? "" })),
    education: profile.education.map((item) => ({ ...item, fieldOfStudy: item.fieldOfStudy ?? "", endDate: item.endDate ?? "", description: item.description ?? "" })),
    portfolio: profile.portfolio.map((item) => ({ ...item, description: item.description ?? "" })),
  };
}

function compactOptionalFields<T extends Record<string, string>>(entry: T): Partial<T> {
  return Object.fromEntries(Object.entries(entry).filter(([, value]) => value !== "")) as Partial<T>;
}

function toUpdateInput(values: ProfileFormValues): UpdateProfileInput {
  return {
    // Empty strings deliberately replace existing text so users can clear it.
    bio: values.bio,
    location: values.location,
    skills: Array.from(new Set(values.skills.split(",").map((skill) => skill.trim()).filter(Boolean))),
    socialLinks: compactOptionalFields({ github: values.github, twitter: values.twitter, linkedin: values.linkedin }),
    experience: values.experience.map((item) => compactOptionalFields(item) as Profile["experience"][number]),
    education: values.education.map((item) => compactOptionalFields(item) as Profile["education"][number]),
    portfolio: values.portfolio.map((item) => compactOptionalFields(item) as Profile["portfolio"][number]),
  };
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1 text-xs text-red-600" role="alert">{message}</p> : null;
}

export function EditProfileModal({ profile, onClose, onSaved }: EditProfileModalProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const form = useForm<ProfileFormValues>({ resolver: zodResolver(profileFormSchema), defaultValues: toFormValues(profile) });
  const experience = useFieldArray({ control: form.control, name: "experience" });
  const education = useFieldArray({ control: form.control, name: "education" });
  const portfolio = useFieldArray({ control: form.control, name: "portfolio" });

  async function onSubmit(values: ProfileFormValues): Promise<void> {
    setFormError(null);
    try {
      let savedProfile = await updateProfile(toUpdateInput(values));
      const avatar = avatarInputRef.current?.files?.[0];
      const coverImage = coverInputRef.current?.files?.[0];
      if (avatar) savedProfile = await uploadProfileImage("avatar", avatar);
      if (coverImage) savedProfile = await uploadProfileImage("cover-image", coverImage);
      onSaved(savedProfile);
      onClose();
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 p-4" role="presentation">
      <div className="mx-auto my-4 w-full max-w-3xl rounded-xl bg-white shadow-xl" role="dialog" aria-modal="true" aria-labelledby="edit-profile-title">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-7">
          <h2 id="edit-profile-title" className="text-xl font-semibold text-slate-950">Edit profile</h2>
          <button type="button" onClick={onClose} className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-950" aria-label="Close edit profile"><X /></button>
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-7 p-5 sm:p-7">
          {formError ? <p className="rounded-md bg-red-50 p-3 text-sm text-red-800" role="alert">{formError}</p> : null}
          <section className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="avatar">Avatar image</Label><Input ref={avatarInputRef} id="avatar" type="file" accept="image/jpeg,image/png,image/webp" /></div>
            <div className="space-y-2"><Label htmlFor="cover-image">Cover image</Label><Input ref={coverInputRef} id="cover-image" type="file" accept="image/jpeg,image/png,image/webp" /></div>
          </section>
          <section className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2"><Label htmlFor="bio">Bio</Label><textarea id="bio" className={textareaClassName} {...form.register("bio")} /><FieldError message={form.formState.errors.bio?.message} /></div>
            <div className="space-y-2"><Label htmlFor="location">Location</Label><Input id="location" {...form.register("location")} /><FieldError message={form.formState.errors.location?.message} /></div>
            <div className="space-y-2"><Label htmlFor="skills">Skills</Label><Input id="skills" placeholder="TypeScript, Node.js, MongoDB" {...form.register("skills")} /><FieldError message={form.formState.errors.skills?.message} /></div>
            <div className="space-y-2"><Label htmlFor="github">GitHub URL</Label><Input id="github" type="url" {...form.register("github")} /><FieldError message={form.formState.errors.github?.message} /></div>
            <div className="space-y-2"><Label htmlFor="twitter">Twitter URL</Label><Input id="twitter" type="url" {...form.register("twitter")} /><FieldError message={form.formState.errors.twitter?.message} /></div>
            <div className="space-y-2 sm:col-span-2"><Label htmlFor="linkedin">LinkedIn URL</Label><Input id="linkedin" type="url" {...form.register("linkedin")} /><FieldError message={form.formState.errors.linkedin?.message} /></div>
          </section>
          <section className="space-y-4"><div className="flex items-center justify-between"><h3 className="font-semibold text-slate-950">Experience</h3><Button type="button" className="h-8 w-auto gap-1 px-3 text-xs" onClick={() => experience.append({ company: "", title: "", location: "", startDate: "", endDate: "", description: "" })}><Plus size={14} /> Add</Button></div>{experience.fields.map((field, index) => <div className="rounded-lg border border-slate-200 p-4" key={field.id}><div className="mb-3 flex justify-end"><button type="button" onClick={() => experience.remove(index)} className="text-sm text-red-600 hover:underline"><Trash2 className="inline" size={14} /> Remove</button></div><div className="grid gap-3 sm:grid-cols-2"><Input placeholder="Job title" {...form.register(`experience.${index}.title`)} /><Input placeholder="Company" {...form.register(`experience.${index}.company`)} /><Input placeholder="Location" {...form.register(`experience.${index}.location`)} /><div className="grid grid-cols-2 gap-2"><Input type="month" aria-label="Experience start date" {...form.register(`experience.${index}.startDate`)} /><Input type="month" aria-label="Experience end date" {...form.register(`experience.${index}.endDate`)} /></div><textarea className={`${textareaClassName} sm:col-span-2`} placeholder="Description" {...form.register(`experience.${index}.description`)} /></div></div>)}</section>
          <section className="space-y-4"><div className="flex items-center justify-between"><h3 className="font-semibold text-slate-950">Education</h3><Button type="button" className="h-8 w-auto gap-1 px-3 text-xs" onClick={() => education.append({ institution: "", degree: "", fieldOfStudy: "", startDate: "", endDate: "", description: "" })}><Plus size={14} /> Add</Button></div>{education.fields.map((field, index) => <div className="rounded-lg border border-slate-200 p-4" key={field.id}><div className="mb-3 flex justify-end"><button type="button" onClick={() => education.remove(index)} className="text-sm text-red-600 hover:underline"><Trash2 className="inline" size={14} /> Remove</button></div><div className="grid gap-3 sm:grid-cols-2"><Input placeholder="Institution" {...form.register(`education.${index}.institution`)} /><Input placeholder="Degree" {...form.register(`education.${index}.degree`)} /><Input placeholder="Field of study" {...form.register(`education.${index}.fieldOfStudy`)} /><div className="grid grid-cols-2 gap-2"><Input type="month" aria-label="Education start date" {...form.register(`education.${index}.startDate`)} /><Input type="month" aria-label="Education end date" {...form.register(`education.${index}.endDate`)} /></div><textarea className={`${textareaClassName} sm:col-span-2`} placeholder="Description" {...form.register(`education.${index}.description`)} /></div></div>)}</section>
          <section className="space-y-4"><div className="flex items-center justify-between"><h3 className="font-semibold text-slate-950">Projects</h3><Button type="button" className="h-8 w-auto gap-1 px-3 text-xs" onClick={() => portfolio.append({ title: "", url: "", description: "" })}><Plus size={14} /> Add</Button></div>{portfolio.fields.map((field, index) => <div className="rounded-lg border border-slate-200 p-4" key={field.id}><div className="mb-3 flex justify-end"><button type="button" onClick={() => portfolio.remove(index)} className="text-sm text-red-600 hover:underline"><Trash2 className="inline" size={14} /> Remove</button></div><div className="grid gap-3"><Input placeholder="Project title" {...form.register(`portfolio.${index}.title`)} /><Input type="url" placeholder="Project URL" {...form.register(`portfolio.${index}.url`)} /><textarea className={textareaClassName} placeholder="Description" {...form.register(`portfolio.${index}.description`)} /></div></div>)}</section>
          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end"><Button type="button" className="w-auto bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50" onClick={onClose}>Cancel</Button><Button type="submit" className="w-auto" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Saving..." : "Save changes"}</Button></div>
        </form>
      </div>
    </div>
  );
}
