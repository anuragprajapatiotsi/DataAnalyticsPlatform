export interface ClassificationOwner {
  id: string;
  email?: string;
  username?: string;
  display_name?: string;
  name?: string;
}

export interface ClassificationDomain {
  id: string;
  name: string;
  display_name?: string;
  description?: string;
  is_active?: boolean;
}

export interface ClassificationDetectionPattern {
  type: string;
  pattern: string;
  confidence: number;
}

export interface ClassificationTag {
  id: string;
  classification_id: string;
  org_id: string;
  name: string;
  display_name: string;
  description: string;
  icon_url: string;
  color: string;
  detection_patterns: ClassificationDetectionPattern[];
  auto_classify: boolean;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  owners: ClassificationOwner[];
  domains: ClassificationDomain[];
}

export interface Classification {
  id: string;
  org_id: string;
  name: string;
  display_name: string;
  description: string;
  mutually_exclusive: boolean;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  owners: ClassificationOwner[];
  domains: ClassificationDomain[];
}

export interface GetClassificationsParams {
  search?: string;
  is_active?: boolean;
  mutually_exclusive?: boolean;
  created_by?: string;
  owner_id?: string;
  catalog_domain_id?: string;
  skip?: number;
  limit?: number;
}

export interface UpdateClassificationRequest {
  name: string;
  display_name: string;
  description: string;
  mutually_exclusive: boolean;
  owner_ids: string[];
  domain_ids: string[];
  is_active: boolean;
}

export interface CreateClassificationRequest {
  name: string;
  display_name: string;
  description: string;
  mutually_exclusive: boolean;
  owner_ids: string[];
  domain_ids: string[];
}

export interface CreateClassificationTagRequest {
  name: string;
  display_name: string;
  description: string;
  icon_url: string;
  color: string;
  detection_patterns: ClassificationDetectionPattern[];
  auto_classify: boolean;
  owner_ids: string[];
  domain_ids: string[];
}

export interface UpdateClassificationTagRequest
  extends CreateClassificationTagRequest {
  is_active: boolean;
}
