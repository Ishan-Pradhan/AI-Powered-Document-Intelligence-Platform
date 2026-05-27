import { useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

function EmailVerificationPage() {
  const cooldownSeconds = 30

  const [secondsLeft, setSecondsLeft] = useState(cooldownSeconds)
  const [resentCount, setResentCount] = useState(0)

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

  const handleResend = () => {
    setResentCount((c) => c + 1)
    setSecondsLeft(cooldownSeconds)
  }

  return (
    <div className="min-h-svh bg-background text-foreground">
      <div className="mx-auto flex min-h-svh w-full max-w-6xl items-center justify-center p-6">
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

              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={secondsLeft > 0}
                onClick={handleResend}
              >
                {secondsLeft > 0
                  ? `Resend email in ${formattedCountdown}`
                  : "Resend verification email"}
              </Button>

              {resentCount > 0 ? (
                <p className="text-xs text-muted-foreground">
                  Verification email sent again.
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default EmailVerificationPage;