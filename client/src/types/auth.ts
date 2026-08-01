export type UserRole = "user" | "admin";

export interface AuthUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegistrationInput extends LoginCredentials {
  name: string;
  username: string;
}

export interface ApiSuccessResponse<TData> {
  success: true;
  message: string;
  data: TData;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error: {
    code: string;
    details: Record<string, unknown> | Array<Record<string, unknown>> | null;
  };
}
