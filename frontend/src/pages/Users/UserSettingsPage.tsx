import { useState } from "react";
import {
  Eye,
  EyeOff,
  KeyRound,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";

import { changeOwnPassword } from "@/api/admin";

type MessageState = {
  type: "success" | "error";
  text: string;
} | null;

type PasswordFieldProps = {
  label: string;
  value: string;
  show: boolean;
  onToggle: () => void;
  onChange: (value: string) => void;
};

function PasswordField({
  label,
  value,
  show,
  onToggle,
  onChange,
}: PasswordFieldProps) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">
        {label}
      </label>

      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          className="h-10 w-full rounded-md border border-border bg-background px-3 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </div>
  );
}

export default function UserSettingsPage() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [show, setShow] = useState({
    current: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [message, setMessage] = useState<MessageState>(null);

  const mutation = useMutation({
    mutationFn: changeOwnPassword,

    onSuccess: () => {
      setMessage({
        type: "success",
        text: "Your password has been updated successfully.",
      });

      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    },

    onError: (error: unknown) => {
      const err = error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };

      setMessage({
        type: "error",
        text:
          err.response?.data?.message ??
          "Failed to update password. Please try again.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setMessage(null);

    if (form.newPassword !== form.confirmPassword) {
      setMessage({
        type: "error",
        text: "New passwords do not match.",
      });
      return;
    }

    if (form.newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "Password must be at least 6 characters.",
      });
      return;
    }

    mutation.mutate({
      currentPassword: form.currentPassword,
      newPassword: form.newPassword,
    });
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background p-8">
      <div className="mx-auto max-w-xl space-y-8">
        {/* Header */}
        <div className="border-b border-border pb-6">
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <KeyRound className="size-6 text-primary-500" />
            Security Settings
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Change your password and keep your account secure.
          </p>
        </div>

        {/* Password Card */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-base font-semibold">Change Password</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Enter your current password and choose a new one.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <PasswordField
              label="Current Password"
              value={form.currentPassword}
              show={show.current}
              onToggle={() =>
                setShow((prev) => ({
                  ...prev,
                  current: !prev.current,
                }))
              }
              onChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  currentPassword: value,
                }))
              }
            />

            <PasswordField
              label="New Password"
              value={form.newPassword}
              show={show.newPassword}
              onToggle={() =>
                setShow((prev) => ({
                  ...prev,
                  newPassword: !prev.newPassword,
                }))
              }
              onChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  newPassword: value,
                }))
              }
            />

            <PasswordField
              label="Confirm New Password"
              value={form.confirmPassword}
              show={show.confirmPassword}
              onToggle={() =>
                setShow((prev) => ({
                  ...prev,
                  confirmPassword: !prev.confirmPassword,
                }))
              }
              onChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  confirmPassword: value,
                }))
              }
            />

            {message && (
              <div
                className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${
                  message.type === "success"
                    ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-600"
                    : "border-destructive/20 bg-destructive/5 text-destructive"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle2 className="size-4 shrink-0" />
                ) : (
                  <XCircle className="size-4 shrink-0" />
                )}

                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={
                mutation.isPending ||
                !form.currentPassword ||
                !form.newPassword ||
                !form.confirmPassword
              }
              className="inline-flex h-10 items-center gap-2 rounded-md bg-primary-500 px-4 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {mutation.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}

              {mutation.isPending ? "Updating Password..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
