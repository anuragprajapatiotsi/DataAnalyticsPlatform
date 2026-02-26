import { api } from "@/services/api";
import type {
  AuthMessageResponse,
  LoginRequest,
  LoginResponse,
  SessionResponse,
  SignupRequest,
} from "@/services/api/types";

export const authApi = {
  async login(payload: LoginRequest) {
    const response = await api.post<LoginResponse>("/auth/login?name=primary", {
      login: payload.email, // Using email as login as per form/types
      password: payload.password,
    });
    return response.data;
  },
  async signup(payload: SignupRequest) {
    const response = await api.post<SessionResponse>("/auth/signup", payload);
    return response.data;
  },
  async refresh() {
    const response = await api.post<LoginResponse>(
      "/auth/refresh?name=primary",
    );
    return response.data;
  },
  async me() {
    const response = await api.get<SessionResponse>("/auth/me?name=primary");
    return response.data;
  },
  async logout() {
    const response = await api.post<AuthMessageResponse>(
      "/auth/logout?name=primary",
    );
    return response.data;
  },
};
