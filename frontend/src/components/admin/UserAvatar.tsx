import { getInitials } from "@/helpers/getInitials";
import type { AdminUser } from "@/types/ApiTypes";

export function UserAvatar({ user }: { user: AdminUser }) {
  if (user.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.name}
        className="size-8 rounded-full object-cover"
      />
    );
  }
  return (
    <div className="size-8 rounded-full bg-primary-500/20 text-primary-600 flex items-center justify-center text-xs font-bold">
      {getInitials(user.name)}
    </div>
  );
}
