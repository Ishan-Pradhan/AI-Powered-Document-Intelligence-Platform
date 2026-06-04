import { useState } from "react";
import {
  Eye,
  EyeOff,
  KeyRound,
  CheckCircle2,
  XCircle,
  Loader2,
  User as UserIcon,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { changeOwnPassword } from "@/api/admin";
import { useAuthStore } from "@/store/auth.store";

export default function UserSettingsPage() {
  const user = useAuthStore((state) => state.user);

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [show, setShow] = useState({
    current: false,
    newPw: false,
    confirm: false,
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: changeOwnPassword,
    onSuccess: () => {
      setSuccess(true);
      setError("");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setSuccess(false), 4000);
    },
    onError: (err: any) => {
      setError(
        err?.response?.data?.message ?? "Failed to change password. Try again.",
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.newPassword !== form.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (form.newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    mutation.mutate({
      currentPassword: form.currentPassword,
      newPassword: form.newPassword,
    });
  };

  const fields = [
    {
      key: "currentPassword" as const,
      label: "Current Password",
      showKey: "current" as const,
    },
    {
      key: "newPassword" as const,
      label: "New Password",
      showKey: "newPw" as const,
    },
    {
      key: "confirmPassword" as const,
      label: "Confirm New Password",
      showKey: "confirm" as const,
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-background p-8 text-foreground">
      <div className="max-w-xl mx-auto space-y-8">
        {/* ── Header ── */}
        <div className="border-b border-border pb-6">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <UserIcon className="size-6 text-primary-500" />
            Profile Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your personal profile and account credentials.
          </p>
        </div>

        {/* ── Profile Info ── */}
        <div className="border border-border rounded-xl bg-card p-6">
          <h2 className="text-base font-semibold text-foreground mb-4">
            Account Information
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Full Name</p>
              <p className="text-sm font-medium text-foreground">
                {user?.name ?? "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email Address</p>
              <p className="text-sm font-medium text-foreground">
                {user?.email ?? "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Account Role</p>
              <p className="text-sm font-medium text-foreground capitalize">
                {user?.role ?? "user"}
              </p>
            </div>
          </div>
        </div>

        {/* ── Security / Change Password ── */}
        <div className="border border-border rounded-xl bg-card p-6">
          <div className="flex items-center gap-2 mb-1">
            <KeyRound className="size-5 text-primary-500" />
            <h2 className="text-base font-semibold text-foreground">
              Change Password
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mb-5">
            Update your account password. You'll need your current password to
            confirm.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(({ key, label, showKey }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  {label}
                </label>
                <div className="relative">
                  <input
                    type={show[showKey] ? "text" : "password"}
                    value={form[key]}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                    className="w-full h-9 rounded-md border border-border bg-background px-3 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="••••••••"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShow((prev) => ({
                        ...prev,
                        [showKey]: !prev[showKey],
                      }))
                    }
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {show[showKey] ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}

            {error && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <XCircle className="size-3" /> {error}
              </p>
            )}
            {success && (
              <p className="text-xs text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="size-3" /> Password changed
                successfully!
              </p>
            )}

            <button
              type="submit"
              disabled={
                mutation.isPending ||
                !form.currentPassword ||
                !form.newPassword ||
                !form.confirmPassword
              }
              className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-primary-500 text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mutation.isPending && (
                <Loader2 className="size-3.5 animate-spin" />
              )}
              {mutation.isPending ? "Saving..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
