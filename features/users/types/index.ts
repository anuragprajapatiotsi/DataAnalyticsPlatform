export interface UserTeam {
  id: string;
  name: string;
  display_name: string;
}

export interface UserRole {
  id: string;
  name: string;
  display_name: string;
}

export interface AdminUser {
  id: string;
  email: string;
  username: string;
  display_name: string;
  description: string;
  is_admin: boolean;
  is_active: boolean;
  is_verified: boolean;
  teams: UserTeam[];
  roles: UserRole[];
  last_login?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserPolicy {
  id: string;
  name: string;
  description: string;
}

export interface GetUserParams {
  search?: string;
  is_active?: boolean;
  is_admin?: boolean;
  is_verified?: boolean;
  team_id?: string;
  role_id?: string;
  policy_id?: string;
  domain_id?: string;
  skip?: number;
  limit?: number;
}

export interface CreateUserRequest {
  email: string;
  display_name: string;
  description: string;
  password: string;
  confirm_password: string;
  is_admin: boolean;
  team_ids: string[];
  role_ids: string[];
  domain_ids: string[];
}

export interface UpdateUserRequest {
  display_name: string;
  description: string;
  is_admin: boolean;
  is_active: boolean;
  team_ids: string[];
  role_ids: string[];
  domain_ids: string[];
}
export interface ResetPasswordRequest {
  new_password: string;
  confirm_password: string;
}
