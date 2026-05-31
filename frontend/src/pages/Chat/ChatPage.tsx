import React from "react"

export default function ChatPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Welcome to Chat</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Select an existing conversation from the sidebar or start a new one to begin analyzing your documents.
        </p>
      </div>
    </div>
  )
}
