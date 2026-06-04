import { useAuthStore } from "@/store/auth.store";
import { logout } from "@/api/auth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function useAuthActions() {
  const clearUser = useAuthStore((s) => s.clearUser);
  const navigate = useNavigate();

  const signOut = async () => {
    try {
      await logout();
      toast.success("User signed out successfully");
    } catch {
      toast.error("Failed to sign out");
    } finally {
      clearUser();
      navigate("/login", { replace: true });
    }
  };

  return { signOut };
}

export function useIsAdmin() {
  const user = useAuthStore((s) => s.user);
  return user?.role === "admin";
}
