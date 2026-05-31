import ChatSidebar from "@/components/chat/ChatSidebar"
import { Outlet } from "react-router-dom"

export default function ChatLayout() {
  return (
    <div className="flex h-svh w-full overflow-hidden bg-background">
      <ChatSidebar />
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}
