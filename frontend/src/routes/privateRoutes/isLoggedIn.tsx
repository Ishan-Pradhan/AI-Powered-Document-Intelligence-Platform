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
		isVerified?: boolean
		role?: "admin" | "user"
	}
	message: string
}

function RequireAuth() {
	const location = useLocation()
	const user = useAuthStore((state) => state.user)
	const setUser = useAuthStore((state) => state.setUser)
	const clearUser = useAuthStore((state) => state.clearUser)

	const [isChecking, setIsChecking] = useState(() => !user)

	useEffect(() => {
		if (user || !isChecking) {
			return
		}

		let cancelled = false

		const fetchCurrentUserIfNeeded = async () => {
			try {
				const response = await api.get<CurrentUserResponse>(
					"/api/v1/auth/current-user"
				)
				if (cancelled) return
				setUser(response.data.data)
			} catch {
				if (cancelled) return
				clearUser()
			} finally {
				if (!cancelled) setIsChecking(false)
			}
		}

		void fetchCurrentUserIfNeeded()

		return () => {
			cancelled = true
		}
	}, [user, isChecking, setUser, clearUser])

	if (user) return <Outlet />
	if (isChecking) return null

	return (
		<Navigate
			to="/login"
			replace
			state={{ from: location.pathname + location.search }}
		/>
	)
}

export default RequireAuth
