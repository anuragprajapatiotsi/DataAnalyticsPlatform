export type AuthUser = {
  id: string;
  email: string;
  name?: string;
};

export type SessionResponse = {
  user: AuthUser | null;
};

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
