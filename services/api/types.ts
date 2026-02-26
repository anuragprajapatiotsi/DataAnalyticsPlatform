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
