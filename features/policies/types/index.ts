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

export interface GetPoliciesParams {
  skip?: number;
  limit?: number;
  name?: string;
}

export interface GetPoliciesResponse {
  data: Policy[];
  total: number;
}
