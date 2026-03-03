"use client";

import { useRouter } from "next/navigation";

import { AuthForm } from "@/shared/components/forms/auth-form";
import { useAuth } from "@/shared/hooks/use-auth";
import { signupSchema } from "@/shared/utils/validation";

export default function SignupPage() {
  const router = useRouter();
  const { signup, errorMessage, isLoading } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-8">
      <AuthForm
        title="Create account"
        description="Start your analytics workspace."
        submitLabel="Sign Up"
        schema={signupSchema}
        fields={[
          {
            name: "name",
            label: "Full name",
            type: "text",
            placeholder: "John Doe",
          },
          {
            name: "email",
            label: "Email",
            type: "email",
            placeholder: "name@company.com",
          },
          {
            name: "password",
            label: "Password",
            type: "password",
            placeholder: "********",
          },
          {
            name: "confirmPassword",
            label: "Confirm password",
            type: "password",
            placeholder: "********",
          },
        ]}
        defaultValues={{
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
        }}
        errorMessage={errorMessage}
        isSubmitting={isLoading}
        onSubmit={async (values) => {
          await signup({
            name: values.name,
            email: values.email,
            password: values.password,
          });
          router.replace("/dashboard");
        }}
        footerText="Already have an account?"
        footerLinkText="Sign in"
        footerLinkHref="/login"
      />
    </div>
  );
}
