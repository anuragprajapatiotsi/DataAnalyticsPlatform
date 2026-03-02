import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://deltameta-backend.vercel.app";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Global logout helper
export const handleLogout = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("token_expiry");
    localStorage.removeItem("user");
    // Dispatch event so AuthProvider can handle soft redirect
    window.dispatchEvent(new Event("auth-logout"));
  }
};

// Request interceptor to attach token
api.interceptors.request.use(
  async (config) => {
    if (typeof window === "undefined") return config;

    // Do not intercept refresh requests
    if (config.url?.includes("/auth/refresh")) {
      return config;
    }

    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for reactive 401 handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If the refresh request itself failed, logout
      if (originalRequest.url?.includes("/auth/refresh")) {
        handleLogout();
        return Promise.reject(error);
      }

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const currentToken = localStorage.getItem("token");
      if (!currentToken) {
        handleLogout();
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh?name=primary`,
          {},
          {
            headers: {
              Authorization: `Bearer ${currentToken}`,
              Accept: "application/json",
            },
          },
        );

        const { access_token, expires_in } = response.data;
        localStorage.setItem("token", access_token);
        const expiryTime = Date.now() + expires_in * 1000;
        localStorage.setItem("token_expiry", expiryTime.toString());

        // Notify app of token update
        window.dispatchEvent(new Event("auth-token-updated"));

        processQueue(null, access_token);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        handleLogout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
