import type { UserRole } from "../models/User";

export interface AuthenticatedRequestUser {
  id: string;
  role: UserRole;
}
