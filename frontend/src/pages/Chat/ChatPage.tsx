import { useParams } from "react-router-dom";
import { LoaderCircle } from "lucide-react";
import { useChatSession } from "@/hooks/chats/useChatSession";
import { ChatBubble } from "@/components/chat/ChatBubble";
import { EmptyState } from "@/components/chat/EmptyState";
import { ChatInput } from "@/components/chat/ChatInput";

export default function ChatPage() {
  const { chatId } = useParams();
  const {
    messages,
    isLoading,
    isError,
    isSending,
    draft,
    setDraft,
    handleSend,
    bottomRef,
    isNewChat,
    title,
  } = useChatSession(chatId);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <header className="border-b border-border/80 bg-background/95 px-4 py-4 backdrop-blur sm:px-6 shrink-0">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="mt-1 truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              {title}
            </h1>
          </div>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
          {isError && !isNewChat && messages.length === 0 && (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
              Could not load this conversation. Please try again.
            </div>
          )}

          {isLoading && messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8">
              <LoaderCircle className="size-6 animate-spin text-primary-500" />
              <p className="text-xs text-muted-foreground mt-2">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <EmptyState isNewChat={isNewChat} onSelectPrompt={setDraft} />
          ) : (
            <div className="space-y-4 pb-4">
              {messages.map((message) => (
                <ChatBubble key={message.id} message={message} />
              ))}
              {isSending && (
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex size-9 items-center justify-center rounded-full bg-primary-500/10 text-primary-600">
                    <LoaderCircle className="size-4 animate-spin" />
                  </div>
                  Thinking...
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </main>

      <ChatInput
        draft={draft}
        setDraft={setDraft}
        onSend={handleSend}
        isSending={isSending}
      />
    </div>
  );
}
