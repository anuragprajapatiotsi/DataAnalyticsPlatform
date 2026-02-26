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

// Request interceptor to attach token and handle proactive refresh
api.interceptors.request.use(
  async (config) => {
    if (typeof window === "undefined") return config;

    // Do not intercept the refresh request itself to avoid infinite loops
    if (config.url?.includes("/auth/refresh")) {
      return config;
    }

    let token = localStorage.getItem("token");
    const expiry = localStorage.getItem("token_expiry");

    // Proactive Refresh logic:
    // Check if token exists and is about to expire (less than 60 seconds)
    if (token && expiry) {
      const now = Date.now();
      const expiryTime = Number(expiry);
      const isNearExpiry = expiryTime - now < 60000;

      if (isNearExpiry && !isRefreshing) {
        isRefreshing = true;
        try {
          const response = await axios.post(
            `${API_BASE_URL}/auth/refresh?name=primary`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
              },
            },
          );

          const { access_token, expires_in } = response.data;
          token = access_token;

          localStorage.setItem("token", access_token);
          const newExpiryTime = Date.now() + expires_in * 1000;
          localStorage.setItem("token_expiry", newExpiryTime.toString());

          // Trigger a global event to notify AuthContext
          window.dispatchEvent(new Event("auth-token-updated"));

          processQueue(null, access_token);
        } catch (refreshError) {
          processQueue(refreshError, null);
          // If refresh fails, we'll let the request proceed and likely hit a 401
        } finally {
          isRefreshing = false;
        }
      }
    }

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

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes("/auth/refresh")) {
        // If refresh itself failed with 401, logout
        handleGloballyLogout();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const currentToken = localStorage.getItem("token");
      if (!currentToken) {
        handleGloballyLogout();
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

        // Notify AuthContext
        window.dispatchEvent(new Event("auth-token-updated"));

        processQueue(null, access_token);
        originalRequest.headers["Authorization"] = "Bearer " + access_token;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        handleGloballyLogout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

function handleGloballyLogout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("token_expiry");
    window.location.href = "/login";
  }
}
