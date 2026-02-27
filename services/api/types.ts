export type AuthUser = {
  id: string;
  org_id?: string;
  name: string;
  display_name: string;
  description?: string;
  email: string;
  username: string;
  image: string | null;
  is_admin: boolean;
  is_global_admin: boolean;
  is_active: boolean;
  is_verified: boolean;
  last_login_at: string;
  created_at: string;
  updated_at: string;
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

export type SessionResponse = AuthUser;

export type LoginRequest = {
  email: string;
  password: string;
};

export type SignupRequest = {
  name: string;
  email: string;
  password: string;
};

export type AuthMessageResponse = {
  message: string;
};

export interface SettingsItem {
  id: string;
  display_label: string;
  description: string;
  icon: string;
  node_type: "category" | "leaf";
  slug: string;
  nav_url: string | null;
  has_children: boolean;
  sort_order: number;
}
export interface NavItem {
  id: string;
  slug: string;
  display_name: string;
  icon: string;
  nav_url: string | null;
  sort_order: number;
  has_children: boolean;
  children?: NavItem[];
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string;
  contact_email: string;
  owner_id: string;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateOrgRequest {
  name: string;
  description: string;
  contact_email: string;
}

export interface UpdateOrgRequest {
  name: string;
  description: string;
  contact_email: string;
  owner_id: string;
  is_active: boolean;
}
