import type { AxiosError } from "axios"
import { Eye, EyeOff, LockKeyhole } from "lucide-react"
import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"

import { resetPassword } from "@/api/auth"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token") || ""

  const [newPassword, setNewPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
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
    <div className="w-full max-w-sm">
      {/* icon */}
      <div className="mb-6 flex size-12 items-center justify-center rounded-xl bg-primary-500/10">
        <LockKeyhole className="size-5 text-primary-500" strokeWidth={1.75} />
      </div>

      {/* heading */}
      <h1 className="mb-1 text-2xl font-bold tracking-tight text-foreground">
        Set a new password
      </h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Choose something strong. You won&apos;t be asked for it again right away.
      </p>

      {/* form */}
      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid gap-1.5">
          <Label htmlFor="newPassword" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            New password
          </Label>
          {/* password field with toggle */}
          <div className="relative">
            <Input
              id="newPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="At least 6 characters"
              className="h-10 bg-muted/40 pr-10"
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            >
              {showPassword
                ? <EyeOff className="size-4" strokeWidth={1.75} />
                : <Eye className="size-4" strokeWidth={1.75} />}
            </button>
          </div>

          {/* password strength bar */}
          {newPassword.length > 0 && (
            <div className="flex gap-1 pt-1">
              {[1, 2, 3, 4].map((level) => {
                const strength = Math.min(Math.floor(newPassword.length / 3), 4)
                const filled = level <= strength
                const color =
                  strength <= 1 ? "bg-destructive" :
                  strength <= 2 ? "bg-secondary-400" :
                  strength <= 3 ? "bg-primary-400" :
                  "bg-tropical-teal-500"
                return (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${filled ? color : "bg-border"}`}
                  />
                )
              })}
            </div>
          )}
        </div>

        <button
          id="reset-password-submit"
          type="submit"
          disabled={isSubmitting}
          className="flex h-10 w-full items-center justify-center rounded-md bg-primary-500 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Updating…" : "Update password"}
        </button>

        {error ? (
          <div className="rounded-lg border border-destructive/25 bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        {message ? (
          <div className="rounded-lg border border-primary-500/25 bg-primary-500/8 px-3 py-2.5 text-sm text-primary-600">
            {message}
          </div>
        ) : null}

        <p className="text-center text-sm text-muted-foreground">
          <Link
            to="/login"
            className="font-medium text-secondary-500 underline-offset-4 hover:underline"
          >
            ← Back to sign in
          </Link>
        </p>
      </form>
    </div>
  )
}