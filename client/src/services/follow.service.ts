import { api } from "./api";
import type { ApiSuccessResponse } from "@/types/auth";
import type { FollowPage, FollowRelationship } from "@/types/follow";

export async function followUser(userId: string): Promise<FollowRelationship> {
  const response = await api.post<ApiSuccessResponse<{ relationship: FollowRelationship }>>(`/v1/users/${userId}/follow`);
  return response.data.data.relationship;
}
export async function unfollowUser(userId: string): Promise<FollowRelationship> {
  const response = await api.delete<ApiSuccessResponse<{ relationship: FollowRelationship }>>(`/v1/users/${userId}/follow`);
  return response.data.data.relationship;
}
export async function getFollowList(userId: string, kind: "followers" | "following"): Promise<FollowPage> {
  const response = await api.get<ApiSuccessResponse<FollowPage>>(`/v1/users/${userId}/${kind}`, { params: { limit: 20 } });
  return response.data.data;
}
