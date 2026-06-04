import { useAuthStore } from "@/store/auth.store";
import {
  FileClock,
  LogOut,
  MessageSquarePlus,
  PanelLeftClose,
  PanelLeftOpen,
  Database,
  ShieldCheck,
  Settings,
} from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import ChatHistory from "./ChatHistory";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuthActions, useIsAdmin } from "@/hooks/chats/chatSidbarHooks";

export default function ChatSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const user = useAuthStore((state) => state.user);

  const isAdmin = useIsAdmin();
  const { signOut } = useAuthActions();

  return (
    <aside
      data-collapsed={collapsed}
      className={`group/sidebar relative flex h-full flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`}
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
          {collapsed ? (
            <PanelLeftOpen className="size-4" strokeWidth={1.75} />
          ) : (
            <PanelLeftClose className="size-4" strokeWidth={1.75} />
          )}
        </button>
      </div>

      {/* New chat */}
      <div className="px-3 pt-3">
        <NavLink
          to="/chat/new"
          id="new-chat-btn"
          className={({ isActive }) =>
            `flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors
            ${
              isActive
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

        <ChatHistory collapsed={collapsed} />

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
                  `flex items-center  gap-2 rounded-md px-2.5 py-2 text-xs font-medium transition-colors
                  ${
                    isActive
                      ? "bg-primary-500/10 text-primary-600"
                      : "text-foreground hover:bg-muted"
                  }
                  ${collapsed ? "justify-center" : ""}`
                }
              >
                <Database
                  className="size-3.5 shrink-0 text-muted-foreground"
                  strokeWidth={1.75}
                />
                {!collapsed && <span>Knowledge Base</span>}
              </NavLink>
            </nav>
          </div>
        )}
      </div>

      {/* ── footer / user ── */}
      <div className="shrink-0 border-t border-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              id="sidebar-user-menu"
              className={`flex w-full items-center gap-2.5 rounded-lg p-2 text-left hover:bg-muted/80 transition-colors focus:outline-none ${
                collapsed ? "justify-center" : ""
              }`}
            >
              {/* avatar */}
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full overflow-hidden bg-primary-500/10 text-primary-600 text-xs font-bold">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt="user avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{user?.name ? user.name[0].toUpperCase() : "U"}</span>
                )}
              </div>

              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-foreground">
                    {user?.name ?? user?.email ?? "User"}
                  </p>
                  {user?.name && (
                    <p className="truncate text-[10px] text-muted-foreground">
                      {user.email}
                    </p>
                  )}
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56"
            align={collapsed ? "center" : "start"}
            side="right"
          >
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                to="/settings"
                className="flex items-center gap-2 cursor-pointer w-full"
              >
                <Settings className="size-4 text-muted-foreground" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            {isAdmin && (
              <DropdownMenuItem asChild>
                <Link
                  to="/admin"
                  className="flex items-center gap-2 cursor-pointer w-full"
                >
                  <ShieldCheck className="size-4 text-primary-500" />
                  <span>Admin Console</span>
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={signOut}
              variant="destructive"
              className="flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="size-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
