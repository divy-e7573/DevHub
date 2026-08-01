"use client";

import { Github, Linkedin, MapPin, Pencil, Twitter } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FollowButton } from "@/features/follow/components/FollowButton";
import type { FollowRelationship } from "@/types/follow";
import type { Profile } from "@/types/profile";

interface ProfileHeaderProps {
  profile: Profile;
  canEdit: boolean;
  onEdit(): void;
  onFollowChanged(relationship: FollowRelationship): void;
  onOpenList(kind: "followers" | "following"): void;
}

const SOCIAL_LINKS = [
  { key: "github", label: "GitHub", Icon: Github },
  { key: "twitter", label: "Twitter", Icon: Twitter },
  { key: "linkedin", label: "LinkedIn", Icon: Linkedin },
] as const;

export function ProfileHeader({ profile, canEdit, onEdit, onFollowChanged, onOpenList }: ProfileHeaderProps) {
  const initial = profile.user.name.charAt(0).toUpperCase();

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="h-36 bg-gradient-to-r from-slate-950 via-slate-800 to-indigo-900 sm:h-48">
        {profile.coverImageUrl ? (
          <img
            src={profile.coverImageUrl}
            alt="Profile cover"
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>
      <div className="relative px-5 pb-6 sm:px-8">
        <div className="-mt-14 flex flex-col gap-4 sm:-mt-16 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-indigo-100 text-4xl font-semibold text-indigo-700 shadow-sm sm:h-32 sm:w-32">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={`${profile.user.name}'s avatar`}
                  className="h-full w-full object-cover"
                />
              ) : (
                initial
              )}
            </div>
            <div className="pb-1">
              <h1 className="text-2xl font-bold text-slate-950">{profile.user.name}</h1>
              <p className="text-sm text-slate-500">@{profile.user.username}</p>
            </div>
          </div>
          {canEdit ? (
            <Button className="w-auto gap-2" type="button" onClick={onEdit}>
              <Pencil size={16} />
              Edit profile
            </Button>
          ) : <FollowButton userId={profile.user.id} initialIsFollowing={profile.isFollowing} onChanged={onFollowChanged} />}
        </div>
        {profile.location ? (
          <p className="mt-5 flex items-center gap-1.5 text-sm text-slate-600">
            <MapPin size={16} aria-hidden="true" />
            {profile.location}
          </p>
        ) : null}
        {profile.bio ? <p className="mt-4 max-w-3xl whitespace-pre-wrap text-slate-700">{profile.bio}</p> : null}
        <div className="mt-5 flex flex-wrap gap-3">
          {SOCIAL_LINKS.map(({ key, label, Icon }) => {
            const href = profile.socialLinks[key];
            return href ? (
              <a
                key={key}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <Icon size={17} aria-hidden="true" />
                {label}
              </a>
            ) : null;
          })}
        </div>
        <div className="mt-5 flex gap-5 text-sm"><button type="button" onClick={() => onOpenList("followers")} className="text-slate-600 hover:text-indigo-700"><strong className="text-slate-950">{profile.followersCount}</strong> followers</button><button type="button" onClick={() => onOpenList("following")} className="text-slate-600 hover:text-indigo-700"><strong className="text-slate-950">{profile.followingCount}</strong> following</button></div>
      </div>
    </section>
  );
}
