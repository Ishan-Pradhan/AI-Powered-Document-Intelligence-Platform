import type { AxiosError } from "axios"
import { useEffect, useMemo, useState } from "react"
import { useLocation } from "react-router-dom"

import { resendVerificationEmail } from "@/api/auth"
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
    <Card className="w-full max-w-sm">
      <CardHeader className="border-b">
        <CardTitle>Check your email</CardTitle>
        <CardDescription>
          We sent a verification link to your email address.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="grid gap-3">
          <p className="text-sm text-muted-foreground">
            Verify your email to continue.
          </p>

          <div className="grid gap-1.5">
            <Label htmlFor="verifyEmail">Email</Label>
            <Input
              id="verifyEmail"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={isSubmitting || secondsLeft > 0}
            onClick={handleResend}
          >
            {isSubmitting
              ? "Sending..."
              : secondsLeft > 0
                ? `Resend email in ${formattedCountdown}`
                : "Resend verification email"}
          </Button>

          {submitError ? (
            <div className="rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
              {submitError}
            </div>
          ) : null}

          {submitMessage ? (
            <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">
              {submitMessage}
            </div>
          ) : null}

          {devVerifyLink ? (
            <a
              className="text-xs text-primary underline-offset-4 hover:underline"
              href={devVerifyLink}
              target="_blank"
              rel="noreferrer"
            >
              Open verification link (dev)
            </a>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

export default EmailVerificationPage;