import { register } from "@/api/auth";
import { registerSchema, type RegisterInput } from "@/schema/auth.schema";
import { useAuthStore } from "@/store/auth.store";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AxiosError } from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, } from "../ui/card";
import SocialLogins from "./SocialLogins";
import { Label } from "../ui/label";

function RegisterForm() {
    const [submitError, setSubmitError] = useState<string | null>(null)
  const navigate = useNavigate()
  const setUser = useAuthStore((state) => state.setUser)


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
        const response = await register(values)
        setUser(response.data.data)
      } catch (error) {
        const err = error as AxiosError<{ message?: string }>
        setSubmitError(err.response?.data?.message || "Unable to sign up.")
        return
      }
  navigate("/verify-email", { state: { email: values.email } })
    }
  return (
      <div className="flex w-full flex-col items-center justify-center gap-8">
     
   <Card className="w-full max-w-md ring-0">
       <div className="flex flex-col items-center gap-2">
        <h1 className="text-2xl font-bold">Create an account</h1>
        <p className="text-sm text-muted-foreground">
          Enter your details to get started.
        </p>
      </div>

      <CardContent className="pt-4" >
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
                className="py-4"
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
                className="py-4"
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
                className="py-4"
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
                className="py-4"
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

            <Button type="submit" className="w-full py-5 cursor-pointer bg-primary text-white hover:bg-primary/90 transition-colors duration-300 ease-in-out  " disabled={form.formState.isSubmitting}>
              Sign up
            </Button>
          </form>

          {submitError ? (
            <div className="rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
              {submitError}
            </div>
          ) : null}

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-secondary  underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
    </div>
  );
}

export default RegisterForm;