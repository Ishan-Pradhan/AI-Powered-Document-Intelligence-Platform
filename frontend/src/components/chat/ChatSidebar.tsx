import { useAuthStore } from "@/store/auth.store"
import {
  FileClock,
  LogOut,
  MessageSquarePlus,
  PanelLeftClose,
  PanelLeftOpen,
  Database,
  ShieldCheck,
  Settings,
} from "lucide-react"
import { useState } from "react"
import { Link, NavLink, useNavigate } from "react-router-dom"
import { logout } from "@/api/auth"
import { toast } from "sonner"

function getInitials(name?: string, email?: string) {
  if (name) return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
  if (email) return email[0].toUpperCase()
  return "U"
}

export default function ChatSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const user = useAuthStore((state) => state.user)
  const clearUser = useAuthStore((state) => state.clearUser)
  const navigate = useNavigate()

  const isAdmin = user?.role === "admin"

  const handleSignOut = async () => {
    try {
      await logout();
      toast.success("User signed out successfully")
    } catch (error) {
      console.log(error);
      toast.error("Failed to sign out")
    }
    clearUser()
    navigate("/login", { replace: true })
  }

  return (
    <aside
      data-collapsed={collapsed}
      className="group/sidebar relative flex h-full flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-all duration-300"
      style={{ width: collapsed ? "64px" : "260px" }}
    >
      {/* ── top bar ── */}
      <div className="flex h-14 shrink-0 items-center justify-between px-3 border-b border-border">
        {!collapsed && (
          <Link
            to="/chat"
            className="text-sm font-semibold tracking-tight text-foreground truncate"
          >
            DocIntelAI
          </Link>
        )}
        <button
          id="sidebar-collapse-toggle"
          onClick={() => setCollapsed((v) => !v)}
          className="ml-auto flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed
            ? <PanelLeftOpen className="size-4" strokeWidth={1.75} />
            : <PanelLeftClose className="size-4" strokeWidth={1.75} />}
        </button>
      </div>

      <div className="px-3 pt-3">
        <NavLink
          to="/chat/new"
          id="new-chat-btn"
          className={({ isActive }) =>
            `flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors
            ${isActive
              ? "bg-primary-500 text-white"
              : "bg-muted/60 text-foreground hover:bg-muted"
            }
            ${collapsed ? "justify-center px-0" : ""}`
          }
        >
          <MessageSquarePlus className="size-4 shrink-0" strokeWidth={1.75} />
          {!collapsed && <span>New chat</span>}
        </NavLink>
      </div>

      {/* ── history ── */}
      <div className="mt-3 flex-1 overflow-y-auto px-3">
        {!collapsed && (
          <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            <FileClock className="size-3" strokeWidth={1.75} />
            Recent
          </p>
        )}
        <nav className="grid gap-0.5">
          {/* Recent chats can go here */}
        </nav>

        {/* ── Admin operational features ── */}
        {isAdmin && (
          <div className="mt-6">
            {!collapsed && (
              <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                <Database className="size-3" strokeWidth={1.75} />
                Management
              </p>
            )}
            <nav className="grid gap-0.5">
              <NavLink
                to="/knowledge-base"
                id="sidebar-knowledge-base"
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-md px-2.5 py-2 text-xs font-medium transition-colors
                  ${isActive
                    ? "bg-primary-500/10 text-primary-600"
                    : "text-foreground hover:bg-muted"
                  }
                  ${collapsed ? "justify-center" : ""}`
                }
              >
                <Database className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                {!collapsed && <span>Knowledge Base</span>}
              </NavLink>
            </nav>
          </div>
        )}
      </div>

      {/* ── footer / user ── */}
      <div className="shrink-0 border-t border-border p-3">
        {/* dynamic settings / admin console option */}
        <div className="mb-2">
          {isAdmin ? (
            <NavLink
              to="/admin"
              id="sidebar-admin-console"
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors
                ${isActive
                  ? "bg-primary-500/10 text-primary-600 font-semibold"
                  : "text-foreground hover:bg-muted"
                }
                ${collapsed ? "justify-center" : ""}`
              }
            >
              <ShieldCheck className="size-4 shrink-0 text-primary-500" strokeWidth={1.75} />
              {!collapsed && <span>Admin Console</span>}
            </NavLink>
          ) : (
            <NavLink
              to="/settings"
              id="sidebar-settings"
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors
                ${isActive
                  ? "bg-primary-500/10 text-primary-600 font-semibold"
                  : "text-foreground hover:bg-muted"
                }
                ${collapsed ? "justify-center" : ""}`
              }
            >
              <Settings className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
              {!collapsed && <span>Settings</span>}
            </NavLink>
          )}
        </div>

        <div className={`flex items-center gap-2.5 ${collapsed ? "flex-col" : ""}`}>
          {/* avatar */}
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-500/15 text-xs font-semibold text-primary-600">
            {getInitials(user?.name, user?.email)}
          </div>

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-foreground">
                {user?.name ?? user?.email ?? "User"}
              </p>
              {user?.name && (
                <p className="truncate text-[10px] text-muted-foreground">{user.email}</p>
              )}
            </div>
          )}

          <button
            id="sidebar-sign-out"
            onClick={handleSignOut}
            title="Sign out"
            className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LogOut className="size-3.5" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </aside>
  )
}

