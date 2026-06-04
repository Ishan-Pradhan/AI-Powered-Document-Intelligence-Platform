import { useState } from "react";
import { Users, ShieldCheck, Search, ShieldAlert, Loader2 } from "lucide-react";
import { UserRow } from "@/components/admin/UserRow";
import { useAdminUsers, useUserStats } from "@/hooks/admin/adminHooks";
import Stats from "@/components/admin/Stats";

export default function AdminPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, toggleBlock, isToggling } = useAdminUsers(
    currentPage,
    searchQuery,
  );

  const { data: stats } = useUserStats();

  const users = data?.items ?? [];
  const meta = data?.meta ?? { totalItems: 0, totalPages: 1 };

  const totalUsers = stats?.totalUsers ?? 0;
  const blockedCount = stats?.blockedUsers ?? 0;
  const adminsCount = stats?.adminUsers ?? 0;

  return (
    <div className="flex-1 overflow-y-auto bg-background p-8 text-foreground">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* ── Header ── */}
        <div className="border-b border-border pb-6">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ShieldCheck className="size-6 text-primary-500" />
            Admin Console
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage users, control access, and monitor platform registration.
          </p>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <Stats
            label="Total Users"
            value={totalUsers}
            icon={<Users className="size-5 text-primary-500" />}
          />
          <Stats
            label="Admins"
            value={adminsCount}
            icon={<ShieldCheck className="size-5 text-primary-500" />}
          />
          <Stats
            label="Blocked"
            value={blockedCount}
            icon={<ShieldAlert className="size-5 text-destructive" />}
          />
        </div>

        {/* ── User Management ── */}
        <div className="border border-border rounded-xl bg-card overflow-hidden">
          {/* Table header bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 border-b border-border">
            <h2 className="font-semibold text-base flex items-center gap-2">
              <Users className="size-4 text-muted-foreground" />
              User Management
            </h2>
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-muted/40 text-xs uppercase font-semibold text-muted-foreground">
                <tr>
                  <th className="px-6 py-3 border-b border-border">User</th>
                  <th className="px-6 py-3 border-b border-border">Role</th>
                  <th className="px-6 py-3 border-b border-border">Verified</th>
                  <th className="px-6 py-3 border-b border-border">Auth</th>
                  <th className="px-6 py-3 border-b border-border">Joined</th>
                  <th className="px-6 py-3 border-b border-border text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-12 text-sm text-muted-foreground"
                    >
                      <Loader2 className="size-5 animate-spin mx-auto mb-2" />
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-12 text-sm text-muted-foreground"
                    >
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <UserRow
                      key={user.id}
                      user={user}
                      onToggleBlock={toggleBlock}
                      isToggling={isToggling}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination controls ── */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/20">
            <span className="text-xs text-muted-foreground">
              Page {currentPage} of {meta.totalPages || 1} • {meta.totalItems}{" "}
              total users
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((c) => Math.max(1, c - 1))}
                className="h-8 rounded-md border border-border bg-card px-3 text-xs font-semibold hover:bg-muted disabled:opacity-50 transition-colors disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                disabled={currentPage >= meta.totalPages}
                onClick={() =>
                  setCurrentPage((c) => Math.min(meta.totalPages, c + 1))
                }
                className="h-8 rounded-md border border-border bg-card px-3 text-xs font-semibold hover:bg-muted disabled:opacity-50 transition-colors disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
