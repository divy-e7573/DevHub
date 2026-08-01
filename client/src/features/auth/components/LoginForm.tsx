"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { setAuthenticatedUser } from "@/features/auth/authSlice";
import {
  loginSchema,
  type LoginFormValues,
} from "@/schemas/auth.schema";
import { getApiErrorMessage, login } from "@/services/auth.service";
import { useAppDispatch } from "@/store/hooks";

export function LoginForm() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginFormValues): Promise<void> {
    setFormError(null);

    try {
      const user = await login(values);
      dispatch(setAuthenticatedUser(user));
      router.replace("/");
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  }

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
      {searchParams.get("registered") === "true" ? (
        <p
          className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
          role="status"
        >
          Account created. Sign in to continue.
        </p>
      ) : null}
      {formError ? (
        <p
          className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {formError}
        </p>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(form.formState.errors.email)}
          {...form.register("email")}
        />
        {form.formState.errors.email ? (
          <p className="text-sm text-red-600" role="alert">
            {form.formState.errors.email.message}
          </p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={Boolean(form.formState.errors.password)}
          {...form.register("password")}
        />
        {form.formState.errors.password ? (
          <p className="text-sm text-red-600" role="alert">
            {form.formState.errors.password.message}
          </p>
        ) : null}
      </div>
      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Signing in..." : "Sign in"}
      </Button>
      <p className="text-center text-sm text-slate-600">
        New to DevHub?{" "}
        <Link className="font-medium text-slate-900 underline" href="/signup">
          Create an account
        </Link>
      </p>
    </form>
  );
}
