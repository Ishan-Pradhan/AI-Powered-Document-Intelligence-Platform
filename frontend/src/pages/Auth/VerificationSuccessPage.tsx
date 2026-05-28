import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { api } from "@/api/client"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAuthStore } from "@/store/auth.store"
import { CheckCircle2, Loader2 } from "lucide-react"

type CurrentUserResponse = {
  success: boolean
  data: {
    id: string
    name: string
    email: string
    role?: "user" | "admin"
    isVerified?: boolean
  }
  message: string
}

function VerificationSuccessPage() {
  const navigate = useNavigate()
  const setUser = useAuthStore((state) => state.setUser)
  const clearUser = useAuthStore((state) => state.clearUser)

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  )

  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const finalizeLoginAndContinue = async () => {
      try {
        setStatus("loading")
        setErrorMessage(null)
        const response = await api.get<CurrentUserResponse>(
          "/api/v1/auth/current-user"
        )
        if (cancelled) return
        setUser(response.data.data)

        setStatus("success")

        window.setTimeout(() => {
          if (!cancelled) navigate("/")
        }, 1200)
      } catch {
        if (cancelled) return
        clearUser()

        setStatus("error")
        setErrorMessage(
          "We couldn’t finish signing you in. Please sign in again."
        )
      }
    }

    void finalizeLoginAndContinue()

    return () => {
      cancelled = true
    }
  }, [navigate, setUser, clearUser])

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="border-b">
        <CardTitle>Email verified</CardTitle>
        <CardDescription>
          {status === "success"
            ? "Your email has been verified successfully."
            : status === "loading"
              ? "Finalizing your account..."
              : "Verification completed, but sign-in failed."}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4">
        {status === "loading" ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            <span>Logging you in…</span>
          </div>
        ) : status === "success" ? (
          <div className="grid gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="size-4 text-primary" />
              <span>Redirecting to your dashboard…</span>
            </div>
            <Button type="button" className="w-full" onClick={() => navigate("/")}
            >
              Continue
            </Button>
          </div>
        ) : (
          <div className="grid gap-3">
            {errorMessage ? (
              <div className="rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
                {errorMessage}
              </div>
            ) : null}
            <Button
              type="button"
              className="w-full py-5 text-white"
              onClick={() => navigate("/login", { replace: true })}
            >
              Go to sign in
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default VerificationSuccessPage
