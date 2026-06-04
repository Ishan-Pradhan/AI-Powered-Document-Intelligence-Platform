import type { AdminUser } from "@/types/ApiTypes";
import { UserAvatar } from "./UserAvatar";
import {
  CheckCircle2,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
  Users,
  XCircle,
} from "lucide-react";
import { formatDate } from "@/utils/formatDate";

export function UserRow({
  user,
  onToggleBlock,
  isToggling,
}: {
  user: AdminUser;
  onToggleBlock: (id: string) => void;
  isToggling: boolean;
}) {
  return (
    <tr className="hover:bg-muted/10 transition-colors group">
      {/* Name + avatar */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <UserAvatar user={user} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {user.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        </div>
      </td>

      {/* Role */}
      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-semibold ${
            user.role === "admin"
              ? "bg-primary-500/10 text-primary-600"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {user.role === "admin" ? (
            <ShieldCheck className="size-3" />
          ) : (
            <Users className="size-3" />
          )}
          {user.role}
        </span>
      </td>

      {/* Verified */}
      <td className="px-6 py-4">
        {user.isVerified ? (
          <CheckCircle2 className="size-4 text-emerald-500" />
        ) : (
          <XCircle className="size-4 text-muted-foreground" />
        )}
      </td>

      {/* Auth Provider */}
      <td className="px-6 py-4 text-xs text-muted-foreground capitalize">
        {user.authProvider}
      </td>

      {/* Joined */}
      <td className="px-6 py-4 text-xs text-muted-foreground">
        {formatDate(user.createdAt)}
      </td>

      {/* Block toggle */}
      <td className="px-6 py-4 text-right">
        {user.role === "admin" ? (
          <span className="text-xs text-muted-foreground italic">—</span>
        ) : (
          <button
            onClick={() => onToggleBlock(user.id)}
            disabled={isToggling}
            title={user.isBlocked ? "Unblock user" : "Block user"}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              user.isBlocked
                ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                : "bg-destructive/10 text-destructive hover:bg-destructive/20"
            }`}
          >
            {isToggling ? (
              <Loader2 className="size-3 animate-spin" />
            ) : user.isBlocked ? (
              <ShieldOff className="size-3" />
            ) : (
              <ShieldAlert className="size-3" />
            )}
            {user.isBlocked ? "Unblock" : "Block"}
          </button>
        )}
      </td>
    </tr>
  );
}
