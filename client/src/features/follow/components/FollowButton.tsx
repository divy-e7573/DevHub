"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { getApiErrorMessage } from "@/services/auth.service";
import { followUser, unfollowUser } from "@/services/follow.service";
import { useAppSelector } from "@/store/hooks";
import type { FollowRelationship } from "@/types/follow";

export function FollowButton({ userId, initialIsFollowing, onChanged }: { userId: string; initialIsFollowing: boolean; onChanged(relationship: FollowRelationship): void }) {
  const currentUser = useAppSelector((state) => state.auth.user);
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (currentUser?.id === userId) return null;
  async function toggle(): Promise<void> {
    if (!currentUser) { setError("Sign in to follow developers."); return; }
    const prior = isFollowing; setError(null); setIsFollowing(!prior); setIsSaving(true);
    try { const relationship = prior ? await unfollowUser(userId) : await followUser(userId); setIsFollowing(relationship.isFollowing); onChanged(relationship); }
    catch (requestError) { setIsFollowing(prior); setError(getApiErrorMessage(requestError)); }
    finally { setIsSaving(false); }
  }
  return <div className="space-y-1"><Button className="w-auto" type="button" onClick={toggle} disabled={isSaving}>{isSaving ? "Saving..." : isFollowing ? "Following" : "Follow"}</Button>{error ? <p className="text-xs text-red-600" role="alert">{error}</p> : null}</div>;
}
