import type { AxiosError } from "axios"
import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"

import { resetPassword } from "@/api/auth"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token") || ""

  const [newPassword, setNewPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage(null)
    setError(null)

    if (!token) {
      setError("Reset token is missing. Please open the link from your email again.")
      return
    }

    const trimmedPassword = newPassword.trim()
    if (trimmedPassword.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await resetPassword({ token, newPassword: trimmedPassword })
      setMessage(response.data.message || "Password updated successfully.")
      window.setTimeout(() => {
        navigate("/login")
      }, 1500)
    } catch (requestError) {
      const err = requestError as AxiosError<{ message?: string }>
      setError(err.response?.data?.message || "Unable to reset password.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="border-b">
        <CardTitle>Reset password</CardTitle>
        <CardDescription>
          Choose a new password for your account.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="newPassword">New password</Label>
            <Input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="Enter a new password"
            />
          </div>

          <Button type="submit" className="w-full py-5 hover:text-dark-shade-900" disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update password"}
          </Button>

          {error ? (
            <div className="rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
              {error}
            </div>
          ) : null}

          {message ? (
            <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">
              {message}
            </div>
          ) : null}

          <p className="text-center text-sm text-muted-foreground">
            <Link
              to="/login"
              className="font-medium text-secondary underline-offset-4 hover:underline"
            >
              Back to sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}