import { api } from "./api";
import type { ApiSuccessResponse } from "@/types/auth";
import type { Profile, UpdateProfileInput } from "@/types/profile";

interface ProfileResponse {
  profile: Profile;
}

export async function getProfile(username: string): Promise<Profile> {
  const response = await api.get<ApiSuccessResponse<ProfileResponse>>(
    `/v1/profiles/${encodeURIComponent(username)}`,
  );
  return response.data.data.profile;
}

export async function updateProfile(input: UpdateProfileInput): Promise<Profile> {
  const response = await api.put<ApiSuccessResponse<ProfileResponse>>(
    "/v1/profiles/me",
    input,
  );
  return response.data.data.profile;
}

export async function uploadProfileImage(
  kind: "avatar" | "cover-image",
  file: File,
): Promise<Profile> {
  const formData = new FormData();
  formData.append("image", file);

  const response = await api.post<ApiSuccessResponse<ProfileResponse>>(
    `/v1/profiles/me/${kind}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return response.data.data.profile;
}
