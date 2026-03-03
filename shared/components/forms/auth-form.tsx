"use client";

import Link from "next/link";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useForm,
  type SubmitHandler,
} from "react-hook-form";
import type { ZodType } from "zod";

import { Alert } from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

type AuthField = {
  name: string;
  label: string;
  type?: "text" | "email" | "password";
  placeholder?: string;
};

type AuthFormValues = Record<string, string>;

type AuthFormProps = {
  title: string;
  description: string;
  submitLabel: string;
  schema: ZodType;
  fields: Array<AuthField>;
  defaultValues: AuthFormValues;
  errorMessage: string | null;
  isSubmitting: boolean;
  onSubmit: SubmitHandler<AuthFormValues>;
  footerText: string;
  footerLinkText: string;
  footerLinkHref: string;
};

export function AuthForm({
  title,
  description,
  submitLabel,
  schema,
  fields,
  defaultValues,
  errorMessage,
  isSubmitting,
  onSubmit,
  footerText,
  footerLinkText,
  footerLinkHref,
}: AuthFormProps) {
  const [passwordVisibility, setPasswordVisibility] = useState<Record<string, boolean>>(
    {},
  );

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(schema as never) as never,
    defaultValues,
  });

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          {fields.map((field) => {
            const fieldError = form.formState.errors[field.name]?.message;

            return (
              <div className="space-y-1" key={field.name}>
                <Label htmlFor={field.name}>{field.label}</Label>
                <div className="relative">
                  <Input
                    id={field.name}
                    type={
                      field.type === "password" && passwordVisibility[field.name]
                        ? "text"
                        : (field.type ?? "text")
                    }
                    placeholder={field.placeholder}
                    className={field.type === "password" ? "pr-20" : undefined}
                    {...form.register(field.name)}
                  />
                  {field.type === "password" ? (
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 px-3 text-xs font-medium text-slate-600 hover:text-slate-900"
                      onClick={() =>
                        setPasswordVisibility((prev) => ({
                          ...prev,
                          [field.name]: !prev[field.name],
                        }))
                      }
                      aria-label={
                        passwordVisibility[field.name] ? "Hide password" : "Show password"
                      }
                    >
                      {passwordVisibility[field.name] ? "Hide" : "Show"}
                    </button>
                  ) : null}
                </div>
                {fieldError ? (
                  <p className="text-xs text-red-600">{String(fieldError)}</p>
                ) : null}
              </div>
            );
          })}

          {errorMessage ? <Alert variant="destructive">{errorMessage}</Alert> : null}

          <Button className="w-full" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Please wait..." : submitLabel}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600">
          {footerText}{" "}
          <Link className="font-medium text-slate-900 underline" href={footerLinkHref}>
            {footerLinkText}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

