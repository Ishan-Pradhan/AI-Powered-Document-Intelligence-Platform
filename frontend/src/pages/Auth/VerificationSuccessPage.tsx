import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuthStore } from "@/store/auth.store";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { getCurrentUser } from "@/api/auth";

function VerificationSuccessPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setStatus("loading");

        const res = await getCurrentUser();

        if (cancelled) return;

        setUser(res.data.data);
        setStatus("success");
      } catch {
        if (cancelled) return;

        clearUser();
        setStatus("error");
        setErrorMessage("We couldn’t complete sign-in. Please try again.");
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [navigate, setUser, clearUser]);

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="w-full max-w-md rounded-xl ">
        {status === "loading" && (
          <div className="flex flex-col items-center  gap-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>

            <h1 className="text-xl font-semibold">Verifying your account</h1>

            <p className="text-sm text-muted-foreground">
              We’re setting things up for you…
            </p>
          </div>
        )}

        {/* SUCCESS */}
        {status === "success" && (
          <div className="flex flex-col   gap-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-green-500/10">
              <CheckCircle2 className="size-5 text-green-600" />
            </div>

            <h1 className="text-xl font-semibold">Email verified</h1>

            <p className="text-sm text-muted-foreground">
              Your email has been verified successfully. Proceed to chat with
              the assistant.{" "}
              <Link
                to="/chat"
                className="text-primary-500 hover:text-primary-600 hover:underline"
              >
                Start Chatting{" "}
              </Link>
            </p>
          </div>
        )}

        {/* ERROR */}
        {status === "error" && (
          <div className="flex flex-col items-center  gap-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-red-500/10">
              <XCircle className="size-5 text-red-500" />
            </div>

            <h1 className="text-xl font-semibold">Verification failed</h1>

            <p className="text-sm text-muted-foreground">{errorMessage}</p>

            <button
              onClick={() => navigate("/login", { replace: true })}
              className="mt-2 h-10 w-full rounded-md bg-primary-500 text-white text-sm font-medium"
            >
              Go to login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerificationSuccessPage;
