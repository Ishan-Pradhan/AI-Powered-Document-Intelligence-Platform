import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { api } from "@/api/client"
import { useAuthStore } from "@/store/auth.store"
import { CheckCircle2, Loader2, XCircle } from "lucide-react"

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

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const finalizeLoginAndContinue = async () => {
      try {
        setStatus("loading")
        setErrorMessage(null)
        const response = await api.get<CurrentUserResponse>("/api/v1/auth/current-user")
        if (cancelled) return
        setUser(response.data.data)
        setStatus("success")
        window.setTimeout(() => {
          if (!cancelled) navigate("/")
        }, 1800)
      } catch {
        if (cancelled) return
        clearUser()
        setStatus("error")
        setErrorMessage("We couldn't finish signing you in. Please sign in again.")
      }
    }

    void finalizeLoginAndContinue()
    return () => { cancelled = true }
  }, [navigate, setUser, clearUser])

  return (
    <div className="w-full max-w-sm">
      {status === "loading" && (
        <>
          {/* animated icon */}
          <div className="mb-6 flex size-12 items-center justify-center rounded-xl bg-muted">
            <Loader2 className="size-5 animate-spin text-muted-foreground" strokeWidth={1.75} />
          </div>
          <h1 className="mb-1 text-2xl font-bold tracking-tight text-foreground">
            Hang on a sec…
          </h1>
          <p className="text-sm text-muted-foreground">
            Finalizing your account and signing you in.
          </p>
          {/* skeleton shimmer */}
          <div className="mt-8 grid gap-2">
            <div className="h-2 w-3/4 animate-pulse rounded-full bg-muted" />
            <div className="h-2 w-1/2 animate-pulse rounded-full bg-muted" />
          </div>
        </>
      )}

      {status === "success" && (
        <>
          {/* success icon */}
          <div className="mb-6 flex size-12 items-center justify-center rounded-xl bg-tropical-teal-500/10">
            <CheckCircle2 className="size-5 text-tropical-teal-600" strokeWidth={1.75} />
          </div>
          <h1 className="mb-1 text-2xl font-bold tracking-tight text-foreground">
            You&apos;re verified!
          </h1>
          <p className="mb-8 text-sm text-muted-foreground">
            Your email has been confirmed. Redirecting you to the app…
          </p>

          {/* progress bar */}
          <div className="mb-6 h-1 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-tropical-teal-500 transition-all"
              style={{ animation: "grow 1.8s linear forwards" }}
            />
          </div>

          <button
            id="verification-success-continue"
            type="button"
            onClick={() => navigate("/")}
            className="flex h-10 w-full items-center justify-center rounded-md bg-primary-500 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Continue to app
          </button>

          <style>{`
            @keyframes grow {
              from { width: 0% }
              to   { width: 100% }
            }
          `}</style>
        </>
      )}

      {status === "error" && (
        <>
          {/* error icon */}
          <div className="mb-6 flex size-12 items-center justify-center rounded-xl bg-destructive/10">
            <XCircle className="size-5 text-destructive" strokeWidth={1.75} />
          </div>
          <h1 className="mb-1 text-2xl font-bold tracking-tight text-foreground">
            Something went wrong
          </h1>
          <p className="mb-8 text-sm text-muted-foreground">
            Your email was verified, but we couldn&apos;t sign you in automatically.
          </p>

          {errorMessage ? (
            <div className="mb-4 rounded-lg border border-destructive/25 bg-destructive/8 px-3 py-2.5 text-sm text-destructive">
              {errorMessage}
            </div>
          ) : null}

          <button
            id="verification-error-signin"
            type="button"
            onClick={() => navigate("/login", { replace: true })}
            className="flex h-10 w-full items-center justify-center rounded-md bg-primary-500 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Go to sign in
          </button>
        </>
      )}
    </div>
  )
}

export default VerificationSuccessPage
