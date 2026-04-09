export interface DomainPerson {
  id: string;
  email?: string;
  username?: string;
  display_name?: string;
  name?: string;
}

export interface CatalogDomain {
  id: string;
  org_id: string;
  name: string;
  display_name: string;
  description: string;
  domain_type: string;
  icon: string;
  color: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  owners: DomainPerson[];
  experts: DomainPerson[];
}

export interface CreateCatalogDomainRequest {
  name: string;
  display_name: string;
  description: string;
  domain_type: string;
  icon: string;
  color: string;
  owner_ids: string[];
  expert_ids: string[];
}

export interface UpdateCatalogDomainRequest
  extends CreateCatalogDomainRequest {
  is_active: boolean;
}
