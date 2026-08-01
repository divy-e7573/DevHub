import { AxiosError } from "axios";
import { api } from "./api";
import type {
  ApiErrorResponse,
  ApiSuccessResponse,
  AuthUser,
  LoginCredentials,
  RegistrationInput,
} from "@/types/auth";

interface UserResponse {
  user: AuthUser;
}

export async function register(input: RegistrationInput): Promise<AuthUser> {
  const response = await api.post<ApiSuccessResponse<UserResponse>>(
    "/v1/auth/register",
    input,
  );

  return response.data.data.user;
}

export async function login(input: LoginCredentials): Promise<AuthUser> {
  const response = await api.post<ApiSuccessResponse<UserResponse>>(
    "/v1/auth/login",
    input,
  );

  return response.data.data.user;
}

export async function logout(): Promise<void> {
  await api.post("/v1/auth/logout");
}

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await api.get<ApiSuccessResponse<UserResponse>>(
    "/v1/auth/me",
  );

  return response.data.data.user;
}

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const responseData = error.response?.data as ApiErrorResponse | undefined;

    if (responseData?.message) {
      return responseData.message;
    }

    if (!error.response) {
      return "Unable to reach the server. Please try again.";
    }
  }

  return "Something went wrong. Please try again.";
}
