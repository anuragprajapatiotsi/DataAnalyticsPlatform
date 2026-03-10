export interface Team {
  id: string;
  org_id: string;
  parent_team_id: string | null;
  domain_id: string | null;
  name: string;
  display_name: string;
  email: string;
  team_type: "group" | "organization" | string;
  description: string;
  public_team_view: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTeamRequest {
  org_id: string;
  name: string;
  display_name: string;
  email: string;
  team_type: string;
  description: string;
  domain_id?: string;
  public_team_view: boolean;
  parent_team_id?: string | null;
}

export interface UpdateTeamRequest extends Partial<CreateTeamRequest> {}

export interface Role {
  id: string;
  name: string;
  display_name: string;
  description: string;
}

export interface Policy {
  id: string;
  name: string;
  description: string;
}

export interface TeamMember {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  joined_at: string;
}

export interface TeamAsset {
  id: string;
  name: string;
  type: "dataset" | "dashboard" | "pipeline" | "topic" | "mlmodel" | string;
  description?: string;
  owner?: string;
  last_updated: string;
}

export interface TeamDetail extends Team {
  domains: string[];
  owners: Array<{ id: string; name: string }>;
  subscription?: string;
  total_users: number;
}
export interface GetTeamsParams {
  org_id?: string;
  team_type?: string;
  parent_team_id?: string;
  root_only?: boolean;
  domain_id?: string;
  public_team_view?: boolean;
  search?: string;
  is_active?: boolean;
  member_user_id?: string;
  role_id?: string;
  policy_id?: string;
  skip?: number;
  limit?: number;
}
