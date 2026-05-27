import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

import { api } from "@/api/client"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAuthStore } from "@/store/auth.store"

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

  useEffect(() => {
    let cancelled = false

    const finalizeLoginAndContinue = async () => {
      try {
        const response = await api.get<CurrentUserResponse>(
          "/api/v1/auth/current-user"
        )
        if (cancelled) return
        setUser(response.data.data)

        window.setTimeout(() => {
          if (!cancelled) navigate("/")
        }, 800)
      } catch {
        if (cancelled) return
        clearUser()
        navigate("/login", { replace: true })
      }
    }

    void finalizeLoginAndContinue()

    return () => {
      cancelled = true
    }
  }, [navigate, setUser, clearUser])

  return (
    <div className="min-h-svh bg-background text-foreground">
      <div className="mx-auto flex min-h-svh w-full max-w-6xl items-center justify-center p-6">
        <Card className="w-full max-w-sm">
          <CardHeader className="border-b">
            <CardTitle>Email verified</CardTitle>
            <CardDescription>
              Your email has been verified successfully.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">
              Logging you in and redirecting to your dashboard...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default VerificationSuccessPage
