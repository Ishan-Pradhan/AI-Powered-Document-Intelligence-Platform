import type { AxiosError } from "axios";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { resetPassword } from "@/api/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function getPasswordStrength(password: string) {
  if (!password) return 0;
  return Math.min(Math.floor(password.length / 3), 4);
}

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const strength = useMemo(
    () => getPasswordStrength(newPassword),
    [newPassword],
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setMessage(null);
    setError(null);

    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    const trimmedPassword = newPassword.trim();

    if (trimmedPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await resetPassword({
        token,
        newPassword: trimmedPassword,
      });

      setMessage(response.data.message || "Password updated successfully.");
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;

      setError(error.response?.data?.message || "Unable to reset password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div className="mb-6 flex size-12 items-center justify-center rounded-xl bg-primary-500/10">
        <LockKeyhole className="size-5 text-primary-500" />
      </div>

      <h1 className="mb-1 text-2xl font-bold tracking-tight">
        Set a new password
      </h1>

      <p className="mb-8 text-sm text-muted-foreground">
        Choose something strong and secure.
      </p>

      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid gap-1.5">
          <Label htmlFor="newPassword">New password</Label>

          <div className="relative">
            <Input
              id="newPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="h-10 bg-muted/40 pr-10"
            />

            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>

          {newPassword.length > 0 && (
            <div className="flex gap-1 pt-1">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`h-1 flex-1 rounded-full transition-all ${
                    level <= strength
                      ? strength <= 1
                        ? "bg-destructive"
                        : strength <= 2
                          ? "bg-secondary-400"
                          : strength <= 3
                            ? "bg-primary-400"
                            : "bg-emerald-500"
                      : "bg-border"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex h-10 w-full items-center justify-center rounded-md bg-primary-500 text-sm font-medium text-white disabled:opacity-50"
        >
          {isSubmitting ? "Updating…" : "Update password"}
        </button>

        {error && (
          <div className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-lg border border-primary-500/25 bg-primary-500/10 px-3 py-2 text-sm text-primary-600">
            {message}
          </div>
        )}

        <p className="text-center text-sm text-muted-foreground">
          <Link
            to="/login"
            className="font-medium text-secondary-500 hover:underline"
          >
            ← Back to sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
