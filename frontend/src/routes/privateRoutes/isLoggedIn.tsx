import { api } from "@/api/client"
import { useAuthStore } from "@/store/auth.store"
import { useEffect, useState } from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom"

type CurrentUserResponse = {
	success: boolean
	data: {
		id: string
		name: string
		email: string
		avatarUrl?: string | null
		isVerified?: boolean
		role?: "admin" | "user"
	}
	message: string
}

function IsLoggedIn() {
	const location = useLocation()
	const setUser = useAuthStore((state) => state.setUser)
	const clearUser = useAuthStore((state) => state.clearUser)

	// Always start as checking — never trust local state alone
	const [isChecking, setIsChecking] = useState(true)
	const [isAuthenticated, setIsAuthenticated] = useState(false)

	useEffect(() => {
		let cancelled = false

		const verifySession = async () => {
			try {
				const response = await api.get<CurrentUserResponse>(
					"/api/v1/auth/current-user"
				)
				if (cancelled) return
				setUser(response.data.data)
				setIsAuthenticated(true)
			} catch {
				if (cancelled) return
				clearUser()
				setIsAuthenticated(false)
			} finally {
				if (!cancelled) setIsChecking(false)
			}
		}

		void verifySession()

		return () => {
			cancelled = true
		}
	}, [setUser, clearUser])

	// Always wait for the backend to confirm the session
	if (isChecking) return null

	if (isAuthenticated) return <Outlet />

	return (
		<Navigate
			to="/login"
			replace
			state={{ from: location.pathname + location.search }}
		/>
	)
}

export default IsLoggedIn
