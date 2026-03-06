import { AxiosError } from "axios";

export type AppError = {
  message: string;
  status?: number;
  code?: string;
  errors?: Record<string, string | string[]>;
};

export const parseError = (error: any): AppError => {
  // Handle Axios Errors
  if (error?.isAxiosError || error instanceof AxiosError) {
    const status = error.response?.status;
    const data = error.response?.data;

    // Use backend-provided message if available
    if (data?.message || data?.detail || data?.error) {
      const msg = data.message || data.detail || data.error;
      const errors = data.errors || data.validation_errors;

      // Specifically handle duplicate email conflict message for better UX
      if (
        status === 409 &&
        typeof msg === "string" &&
        msg.toLowerCase().includes("email")
      ) {
        return {
          message:
            "A user with this email already exists. Please use a different email address.",
          status,
          code: "DUPLICATE_EMAIL",
          errors: { email: "A user with this email already exists" },
        };
      }

      return {
        message: typeof msg === "string" ? msg : "An unexpected error occurred",
        status,
        code: data.code || (status === 409 ? "CONFLICT" : undefined),
        errors: typeof errors === "object" ? errors : undefined,
      };
    }

    // Default status code mapping
    switch (status) {
      case 400:
        return {
          message: "Invalid request. Please check your inputs.",
          status,
        };
      case 401:
        return {
          message: "Your session has expired. Please login again.",
          status,
        };
      case 403:
        return {
          message: "You do not have permission to perform this action.",
          status,
        };
      case 404:
        return { message: "The requested resource was not found.", status };
      case 409:
        return {
          message: "A conflict occurred with the existing data.",
          status,
        };
      case 422:
        return {
          message: "Validation failed. Please verify the provided details.",
          status,
        };
      case 500:
        return {
          message: "A server error occurred. Please try again later.",
          status,
        };
      default:
        // Handle network/timeout errors
        if (
          error.code === "ECONNABORTED" ||
          error.message === "Network Error"
        ) {
          return {
            message: "Network error. Please check your internet connection.",
            status,
          };
        }
        return {
          message: error.message || "An unexpected error occurred.",
          status,
        };
    }
  }

  // Handle generic Errors
  if (error instanceof Error) {
    return { message: error.message };
  }

  // Handle string errors
  if (typeof error === "string") {
    return { message: error };
  }

  return { message: "An unknown error occurred." };
};
