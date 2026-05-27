import { api } from "@/api/client";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth.store";
import { useNavigate } from "react-router-dom";

function DashboardPage() {
    const navigate = useNavigate()
    const clearUser = useAuthStore((state) => state.clearUser)
    const isAdmin = useAuthStore((state) => state.user?.role === "admin")
  return (
    <div>
      This is dashboard page
      <Button
        onClick={async () => {
          await api.post("/api/v1/auth/logout")
          clearUser()
          navigate("/login")
        }}
      >
        Logout
      </Button>
      {isAdmin && (
        <Button className="ml-2">button for admin only</Button>
      )}
    </div>
  );
}

export default DashboardPage;