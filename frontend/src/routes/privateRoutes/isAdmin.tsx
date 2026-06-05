import { api } from "@/api/client"
import { isAxiosError } from "axios"
import { useAuthStore } from "@/store/auth.store"
import { useEffect, useState } from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom"

type CurrentUserResponse = {
	success: boolean
	data: {
		id: string
		name: string
		email: string
		isVerified: boolean
		role: "user" | "admin"
	}
	message: string
}

function RequireAdmin() {
	const location = useLocation()
	const user = useAuthStore((state) => state.user)
	const setUser = useAuthStore((state) => state.setUser)
	const clearUser = useAuthStore((state) => state.clearUser)

	const isAdmin = user?.role === "admin"
	const shouldCheckServer = !user || !user.role
	const [isChecking, setIsChecking] = useState(() => shouldCheckServer)

	useEffect(() => {
		if (!shouldCheckServer || !isChecking) {
			return
		}

		let cancelled = false

		const fetchCurrentUserForRole = async () => {
			try {
				const response = await api.get<CurrentUserResponse>(
					"/api/v1/auth/current-user"
				)
				if (cancelled) return
				setUser(response.data.data)
			} catch (error: unknown) {
				if (cancelled) return
				const status = isAxiosError(error) ? error.response?.status : undefined
				if (status === 401 || status === 403) {
					clearUser()
				}
			} finally {
				if (!cancelled) setIsChecking(false)
			}
		}

		fetchCurrentUserForRole()

		return () => {
			cancelled = true
		}
	}, [shouldCheckServer, isChecking, setUser, clearUser])

	if (isChecking) return null
	if (!user) {
		return (
			<Navigate
				to="/login"
				replace
				state={{ from: location.pathname + location.search }}
			/>
		)
	}

	if (!isAdmin) {
		return <Navigate to="/" replace />
	}

	return <Outlet />
}

export default RequireAdmin
