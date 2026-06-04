import type { AxiosError } from "axios";
import { KeyRound } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { forgotPassword } from "@/api/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setMessage(null);
    setError(null);

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await forgotPassword(trimmedEmail);

      setMessage(
        response.data.message ||
          "If the account exists, a reset link was sent.",
      );
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;

      setError(error.response?.data?.message || "Unable to send reset email.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div className="mb-6 flex size-12 items-center justify-center rounded-xl bg-secondary-500/10">
        <KeyRound className="size-5 text-secondary-500" />
      </div>

      <h1 className="mb-1 text-2xl font-bold tracking-tight">
        Forgot your password?
      </h1>

      <p className="mb-8 text-sm text-muted-foreground">
        No worries. Enter your email and we’ll send you a reset link.
      </p>

      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid gap-1.5">
          <Label htmlFor="forgotEmail">Email address</Label>

          <Input
            id="forgotEmail"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="h-10 bg-muted/40"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex h-10 w-full items-center justify-center rounded-md bg-primary-500 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Sending…" : "Send reset link"}
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
          Remembered it?{" "}
          <Link
            to="/login"
            className="font-medium text-secondary-500 underline-offset-4 hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
