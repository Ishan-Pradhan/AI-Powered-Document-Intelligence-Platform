import { api } from "@/api/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

function DashboardPage() {
    const navigate = useNavigate()
  return (
    <div>
      This is dashboard page
      <Button onClick={async () => {await api.post("api/v1/auth/logout"); navigate("/login") }}>Logout</Button>
    </div>
  );
}

export default DashboardPage;