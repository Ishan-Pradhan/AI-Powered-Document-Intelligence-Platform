import { register } from "@/api/auth";
import { registerSchema, type RegisterInput } from "@/schema/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AxiosError } from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import SocialLogins from "./SocialLogins";
import { Label } from "../ui/label";

function RegisterForm() {
    const [submitError, setSubmitError] = useState<string | null>(null)
  const navigate = useNavigate()


  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      name: "",
      confirmPassword: "",
      password: "",
    },
    mode: "onSubmit",
  })

  const onSubmit = async (values: RegisterInput) => {
      setSubmitError(null)
  
      try {
        await register(values)
      } catch (error) {
        const err = error as AxiosError<{ message?: string }>
        setSubmitError(err.response?.data?.message || "Unable to sign in.")
        return
      }
  navigate("/verify-email")
    }
  return (
   <Card className="w-full max-w-sm">
      <CardHeader className="border-b">
        <CardTitle>Sign up</CardTitle>
        <CardDescription>Create an account to get started.</CardDescription>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="grid gap-3">
          <SocialLogins
           form={form} setSubmitError={setSubmitError} />

          <div className="flex items-center gap-3 py-1">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                autoComplete="name"
                aria-invalid={Boolean(form.formState.errors.name)}
                {...form.register("name")}
              />
              {form.formState.errors.name?.message ? (
                <p className="text-xs text-error">
                  {form.formState.errors.name.message}
                </p>
              ) : null}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                aria-invalid={Boolean(form.formState.errors.email)}
                {...form.register("email")}
              />
              {form.formState.errors.email?.message ? (
                <p className="text-xs text-error">
                  {form.formState.errors.email.message}
                </p>
              ) : null}
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                aria-invalid={Boolean(form.formState.errors.password)}
                {...form.register("password")}
              />
              {form.formState.errors.password?.message ? (
                <p className="text-xs text-error">
                  {form.formState.errors.password.message}
                </p>
              ) : null}
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="current-password"
                aria-invalid={Boolean(form.formState.errors.confirmPassword)}
                {...form.register("confirmPassword")}
              />
              {form.formState.errors.confirmPassword?.message ? (
                <p className="text-xs text-error">
                  {form.formState.errors.confirmPassword.message}
                </p>
              ) : null}
            </div>

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              Sign up
            </Button>
          </form>

          {submitError ? (
            <div className="rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
              {submitError}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

export default RegisterForm;