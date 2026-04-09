import { api } from "./axios";
import type {
  AuthMessageResponse,
  LoginRequest,
  LoginResponse,
  SessionResponse,
  SignupRequest,
  UpdateProfileRequest,
  Organization,
} from "@/shared/types";

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
  async getMyOrgs() {
    const response = await api.get<Organization[]>("/auth/me/orgs?name=primary");
    return response.data;
  },
  async switchOrg(org_id: string) {
    const response = await api.post<LoginResponse>("/auth/switch-org", {
      org_id,
    });
    return response.data;
  },
  async logout() {
    const response = await api.post<AuthMessageResponse>(
      "/auth/logout?name=primary",
    );
    return response.data;
  },
  async updateProfile(payload: UpdateProfileRequest) {
    const response = await api.put<SessionResponse>("/auth/me", payload);
    return response.data;
  },
  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append("image", file);
    const response = await api.post<{ url: string }>(
      "/auth/upload-avatar",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },
};
