import { z } from "zod";

export const loginSchema = z.object({
  login: z.string().min(1, "Login is required"),
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const PASSWORD_POLICY = {
  minLength: 8,
  rules: [
    { label: "Minimum 8 characters", regex: /.{8,}/ },
    { label: "At least one uppercase letter", regex: /[A-Z]/ },
    { label: "At least one lowercase letter", regex: /[a-z]/ },
    { label: "At least one number", regex: /\d/ },
    { label: "At least one special character", regex: /[@$!%*?&]/ }, // Common special characters
  ],
};

export const validatePassword = (password: string): boolean => {
  return PASSWORD_POLICY.rules.every((rule) => rule.regex.test(password));
};

export const passwordValidator = (_: any, value: string) => {
  if (!value) {
    return Promise.resolve();
  }
  if (validatePassword(value)) {
    return Promise.resolve();
  }
  return Promise.reject(
    new Error("Password does not meet the required security criteria."),
  );
};
