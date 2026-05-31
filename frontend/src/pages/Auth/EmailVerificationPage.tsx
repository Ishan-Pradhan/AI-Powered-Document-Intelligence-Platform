import type { AxiosError } from "axios"
import { Mail } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useLocation } from "react-router-dom"

import { resendVerificationEmail } from "@/api/auth"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthStore } from "@/store/auth.store"

function EmailVerificationPage() {
  const cooldownSeconds = 30

  const location = useLocation()
  const storedEmail = useAuthStore((state) => state.user?.email) || ""
  const stateEmail = (location.state as { email?: string } | null)?.email || ""

  const [secondsLeft, setSecondsLeft] = useState(cooldownSeconds)
  const [email, setEmail] = useState(stateEmail || storedEmail)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [devVerifyLink, setDevVerifyLink] = useState<string | null>(null)

  useEffect(() => {
    if (secondsLeft <= 0) return
    const timeoutId = window.setTimeout(() => {
      setSecondsLeft((s) => (s <= 1 ? 0 : s - 1))
    }, 1000)
    return () => window.clearTimeout(timeoutId)
  }, [secondsLeft])

  const formattedCountdown = useMemo(() => {
    const m = Math.floor(secondsLeft / 60)
    const s = secondsLeft % 60
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  }, [secondsLeft])

  const handleResend = async () => {
    setSubmitMessage(null)
    setSubmitError(null)
    setDevVerifyLink(null)

    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setSubmitError("Please enter your email to resend the verification link.")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await resendVerificationEmail(trimmedEmail)
      setSubmitMessage(response.data.message || "Verification email sent.")
      if (response.data.verifyLink) setDevVerifyLink(response.data.verifyLink)
      setSecondsLeft(cooldownSeconds)
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>
      setSubmitError(err.response?.data?.message || "Unable to resend verification email.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-sm">
      {/* icon */}
      <div className="mb-6 flex size-12 items-center justify-center rounded-xl bg-primary-500/10">
        <Mail className="size-5 text-primary-500" strokeWidth={1.75} />
      </div>

      {/* heading */}
      <h1 className="mb-1 text-2xl font-bold tracking-tight text-foreground">
        Check your inbox
      </h1>
      <p className="mb-8 text-sm text-muted-foreground">
        We sent a verification link to your email. Click it to activate your account.
      </p>

      {/* form */}
      <div className="grid gap-4">
        <div className="grid gap-1.5">
          <Label htmlFor="verifyEmail" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Email address
          </Label>
          <Input
            id="verifyEmail"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="h-10 bg-muted/40"
          />
        </div>

        <button
          id="resend-verification-btn"
          type="button"
          disabled={isSubmitting || secondsLeft > 0}
          onClick={handleResend}
          className="flex h-10 w-full items-center justify-center rounded-md bg-primary-500 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting
            ? "Sending…"
            : secondsLeft > 0
              ? `Resend in ${formattedCountdown}`
              : "Resend verification email"}
        </button>

        {submitError ? (
          <div className="rounded-lg border border-destructive/25 bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
            {submitError}
          </div>
        ) : null}

        {submitMessage ? (
          <div className="rounded-lg border border-primary-500/25 bg-primary-500/8 px-3 py-2.5 text-sm text-primary-600">
            {submitMessage}
          </div>
        ) : null}

        {devVerifyLink ? (
          <a
            className="text-xs text-primary-500 underline-offset-4 hover:underline"
            href={devVerifyLink}
            target="_blank"
            rel="noreferrer"
          >
            Open verification link (dev)
          </a>
        ) : null}
      </div>
    </div>
  )
}

export default EmailVerificationPage