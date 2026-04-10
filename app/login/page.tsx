"use client";

import { useSyncExternalStore } from "react";

import { AuthForm } from "@/shared/components/forms/auth-form";
import { useAuth } from "@/shared/hooks/use-auth";
import { loginSchema } from "@/shared/utils/validation";

export default function LoginPage() {
  const { login, errorMessage, isLoading } = useAuth();
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-8">
      <AuthForm
        title="Welcome back"
        description="Sign in to continue to your dashboard."
        submitLabel="Sign In"
        schema={loginSchema}
        fields={[
          {
            name: "login",
            label: "Email",
            type: "text",
            placeholder: "Your username or email",
          },
          {
            name: "password",
            label: "Password",
            type: "password",
            placeholder: "********",
          },
        ]}
        defaultValues={{
          login: "",
          password: "",
        }}
        errorMessage={errorMessage}
        isSubmitting={isHydrated ? isLoading : false}
        onSubmit={async (values) => {
          await login({
            email: values.login,
            password: values.password,
          });
        }}
        footerText="Don't have an account?"
        footerLinkText="Create one"
        footerLinkHref="/signup"
      />
    </div>
  );
}
