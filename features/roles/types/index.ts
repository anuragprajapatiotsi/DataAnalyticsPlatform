export interface Policy {
  id: string;
  org_id?: string;
  name: string;
  description: string;
  rule_name?: string;
  resource?: string;
  operations?: string[];
}

export interface Role {
  id: string;
  org_id: string;
  name: string;
  description: string;
  is_system_role: boolean;
  policies: Policy[];
  created_at: string;
  updated_at: string;
}

export interface GetRolesParams {
  skip?: number;
  limit?: number;
  search?: string;
  is_system_role?: boolean;
  user_id?: string;
  team_id?: string;
  org_id_assigned?: string;
}

export interface CreateRolePayload {
  name: string;
  description: string;
  policy_ids: string[];
}

export interface RoleUser {
  id: string;
  name: string;
  username: string;
  email: string;
  display_name?: string;
  description?: string;
}

export interface RoleTeam {
  id: string;
  name: string;
  display_name: string;
  description: string;
}
