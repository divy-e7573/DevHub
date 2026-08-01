import { api } from "./api";
import type { ApiSuccessResponse } from "@/types/auth";
import type { SearchResponse, SearchType } from "@/types/search";

export async function search(query: string, type: SearchType): Promise<SearchResponse> {
  const response = await api.get<ApiSuccessResponse<SearchResponse>>("/v1/search", { params: { q: query, type } });
  return response.data.data;
}
