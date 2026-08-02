"use client";

import { useState } from "react";
import type { Profile } from "@/types/profile";
import { GitHubShowcase } from "./GitHubShowcase";
import { ResumeUploader } from "./ResumeUploader";

type ProfileTab = "overview" | "experience" | "education" | "projects" | "github";

const tabs: Array<{ id: ProfileTab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "experience", label: "Experience" },
  { id: "education", label: "Education" },
  { id: "projects", label: "Projects" },
  { id: "github", label: "GitHub" },
];

function DateRange({ startDate, endDate }: { startDate: string; endDate?: string }) {
  return <p className="mt-1 text-sm text-slate-500">{startDate} – {endDate || "Present"}</p>;
}

export function ProfileTabs({ profile, canEdit, onChanged }: { profile: Profile; canEdit: boolean; onChanged(profile: Profile): void }) {
  const [activeTab, setActiveTab] = useState<ProfileTab>("overview");

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex overflow-x-auto border-b border-slate-200 px-3 sm:px-5" role="tablist" aria-label="Profile content">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`shrink-0 border-b-2 px-3 py-4 text-sm font-medium transition-colors ${activeTab === tab.id ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-950"}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="p-5 sm:p-7" role="tabpanel">
        {activeTab === "overview" ? (
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Skills</h2>
            {profile.skills.length ? (
              <ul className="mt-4 flex flex-wrap gap-2" aria-label="Skills">
                {profile.skills.map((skill) => <li key={skill} className="rounded-full bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-800">{skill}</li>)}
              </ul>
            ) : <p className="mt-3 text-sm text-slate-500">No skills added yet.</p>}
          </div>
        ) : null}
        {activeTab === "experience" ? (
          <div className="space-y-6">
            {profile.experience.length ? profile.experience.map((item, index) => (
              <article key={`${item.company}-${item.title}-${index}`} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                <h2 className="font-semibold text-slate-950">{item.title}</h2>
                <p className="text-slate-700">{item.company}{item.location ? ` · ${item.location}` : ""}</p>
                <DateRange startDate={item.startDate} endDate={item.endDate} />
                {item.description ? <p className="mt-3 whitespace-pre-wrap text-sm text-slate-600">{item.description}</p> : null}
              </article>
            )) : <p className="text-sm text-slate-500">No experience added yet.</p>}
          </div>
        ) : null}
        {activeTab === "education" ? (
          <div className="space-y-6">
            {profile.education.length ? profile.education.map((item, index) => (
              <article key={`${item.institution}-${item.degree}-${index}`} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                <h2 className="font-semibold text-slate-950">{item.degree}</h2>
                <p className="text-slate-700">{item.institution}{item.fieldOfStudy ? ` · ${item.fieldOfStudy}` : ""}</p>
                <DateRange startDate={item.startDate} endDate={item.endDate} />
                {item.description ? <p className="mt-3 whitespace-pre-wrap text-sm text-slate-600">{item.description}</p> : null}
              </article>
            )) : <p className="text-sm text-slate-500">No education added yet.</p>}
          </div>
        ) : null}
        {activeTab === "projects" ? (
          <div className="grid gap-4 md:grid-cols-2">
            {profile.portfolio.length ? profile.portfolio.map((project, index) => (
              <article key={`${project.url}-${index}`} className="rounded-lg border border-slate-200 p-4">
                <h2 className="font-semibold text-slate-950">{project.title}</h2>
                {project.description ? <p className="mt-2 text-sm text-slate-600">{project.description}</p> : null}
                <a href={project.url} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm font-medium text-indigo-700 hover:underline">Visit project</a>
              </article>
            )) : <p className="text-sm text-slate-500">No projects added yet.</p>}
          </div>
        ) : null}
        {activeTab === "github" ? <GitHubShowcase profile={profile} canEdit={canEdit} onSynced={onChanged} /> : null}
        {canEdit ? <ResumeUploader onUploaded={onChanged} /> : null}
        {profile.resumeUrl ? <a className="mt-4 inline-flex items-center text-sm font-medium text-indigo-700 hover:underline" href={profile.resumeUrl} target="_blank" rel="noreferrer">View / Download Resume</a> : null}
      </div>
    </section>
  );
}
