"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import { AuthForm } from "@/components/forms/auth-form";
import { useAuth } from "@/hooks/use-auth";
import { loginSchema } from "@/utils/validation";

export default function LoginPage() {
  const router = useRouter();
  const next =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("next")
      : null;
  const { login, errorMessage, isLoading } = useAuth();

  const safeRedirect = useMemo(() => {
    if (!next || !next.startsWith("/") || next.startsWith("//")) {
      return "/dashboard";
    }
    return next;
  }, [next]);

  return (
    <div className="auth-shell">
      <AuthForm
        title="Welcome back"
        description="Sign in to continue to your dashboard."
        submitLabel="Sign In"
        schema={loginSchema}
        fields={[
          { name: "email", label: "Email", type: "email", placeholder: "name@company.com" },
          { name: "password", label: "Password", type: "password", placeholder: "********" },
        ]}
        defaultValues={{
          email: "",
          password: "",
        }}
        errorMessage={errorMessage}
        isSubmitting={isLoading}
        onSubmit={async (values) => {
          await login({
            email: values.email,
            password: values.password,
          });
          router.replace(safeRedirect);
        }}
        footerText="Don't have an account?"
        footerLinkText="Create one"
        footerLinkHref="/signup"
      />
    </div>
  );
}
