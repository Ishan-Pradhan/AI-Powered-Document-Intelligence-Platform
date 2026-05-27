import { zodResolver } from "@hookform/resolvers/zod"
import type { AxiosError } from "axios"
import { useState } from "react"
import { useForm } from "react-hook-form"

import { login } from "@/api/auth"
import { loginSchema, type LoginInput } from "@/schema/auth.schema"
import { useAuthStore } from "@/store/auth.store"

import { Button } from "../ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { useNavigate } from "react-router-dom"
import SocialLogins from "./SocialLogins"

function LoginForm() {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const navigate = useNavigate()
  const setUser = useAuthStore((state) => state.setUser)

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onSubmit",
  })

 

  const onSubmit = async (values: LoginInput) => {
    setSubmitError(null)

    try {
      const response = await login(values)
      setUser(response.data.data)
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>
      setSubmitError(err.response?.data?.message || "Unable to sign in.")
      return
    }

    const redirect = import.meta.env.VITE_AUTH_SUCCESS_REDIRECT as
      | string
      | undefined
      console.log(redirect)
    if (redirect) {
      navigate(redirect)
    } else {
      window.location.reload()
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="border-b">
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Use a provider or your email.</CardDescription>
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

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              Sign in
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
  )
}

export default LoginForm