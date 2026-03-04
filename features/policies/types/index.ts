export interface Policy {
  id: string;
  name: string;
  description: string;
  rule_name?: string;
  resource?: string;
  operations?: string[];
  conditions?: any[];
  created_at: string;
  updated_at: string;
}

export interface Resource {
  id: string;
  name: string;
  key: string;
  label: string;
  operations: string[];
}

export interface ResourceGroup {
  group: string;
  resources: Resource[];
}

export interface Condition {
  attr: string;
  op: string;
  value: string;
}

export interface CreatePolicyPayload {
  name: string;
  description: string;
  rule_name: string;
  resource: string;
  operations: string[];
  conditions: Condition[];
}

export interface PolicyRule {
  id: string;
  name: string;
  rule_name: string;
  resource: string;
  operations: string[];
}

export interface PolicyTeam {
  id: string;
  name: string;
  description: string;
  team_type: string;
}

export interface PolicyRole {
  id: string;
  name: string;
  description: string;
  is_system_role: boolean;
}

export interface GetPoliciesParams {
  skip?: number;
  limit?: number;
  name?: string;
}

export interface GetPoliciesResponse {
  data: Policy[];
  total: number;
}
