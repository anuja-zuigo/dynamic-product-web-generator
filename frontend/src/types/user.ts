export type Role = "user" | "admin";

export interface User {
  id: string;
  email: string;
  role: Role;
  company_name?: string | null;
  created_at?: string;
  updated_at?: string;
}
