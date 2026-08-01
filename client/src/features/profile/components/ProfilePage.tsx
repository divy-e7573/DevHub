"use client";

import { useEffect, useState } from "react";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileSkeleton } from "./ProfileSkeleton";
import { ProfileTabs } from "./ProfileTabs";
import { EditProfileModal } from "./EditProfileModal";
import { getApiErrorMessage } from "@/services/auth.service";
import { getProfile } from "@/services/profile.service";
import { upsertProfile } from "@/features/profile/profileSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { Profile } from "@/types/profile";

export function ProfilePage({ username }: { username: string }) {
  const dispatch = useAppDispatch();
  const sessionUser = useAppSelector((state) => state.auth.user);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    setProfile(null);
    setError(null);
    setIsLoading(true);
    getProfile(username)
      .then((loadedProfile) => {
        if (!isCurrent) return;
        setProfile(loadedProfile);
        dispatch(upsertProfile(loadedProfile));
      })
      .catch((requestError: unknown) => {
        if (isCurrent) setError(getApiErrorMessage(requestError));
      })
      .finally(() => { if (isCurrent) setIsLoading(false); });
    return () => { isCurrent = false; };
  }, [dispatch, username]);

  if (isLoading) return <ProfileSkeleton />;
  if (error || !profile) return <main className="mx-auto max-w-5xl px-4 py-12"><p className="rounded-lg bg-red-50 p-4 text-red-800" role="alert">{error ?? "Profile not found."}</p></main>;
  const canEdit = sessionUser?.username === profile.user.username;
  const saveProfile = (savedProfile: Profile) => { setProfile(savedProfile); dispatch(upsertProfile(savedProfile)); };
  return <main className="mx-auto max-w-5xl space-y-6 px-4 py-8"><ProfileHeader profile={profile} canEdit={canEdit} onEdit={() => setIsEditing(true)} /><ProfileTabs profile={profile} />{isEditing ? <EditProfileModal profile={profile} onClose={() => setIsEditing(false)} onSaved={saveProfile} /> : null}</main>;
}
