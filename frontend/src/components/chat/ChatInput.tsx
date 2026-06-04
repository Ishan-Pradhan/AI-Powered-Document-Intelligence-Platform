import React from "react";
import { LoaderCircle, SendHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  draft: string;
  setDraft: (draft: string) => void;
  onSend: (event: React.FormEvent<HTMLFormElement>) => void;
  isSending: boolean;
}

export function ChatInput({ draft, setDraft, onSend, isSending }: ChatInputProps) {
  return (
    <footer className="border-t border-border/80 bg-background/95 px-4 py-4 backdrop-blur sm:px-6 shrink-0">
      <form onSubmit={onSend} className="mx-auto w-full max-w-5xl">
        <div className="rounded-3xl border border-border bg-card p-3 shadow-sm flex items-center gap-3">
          <label className="sr-only" htmlFor="chat-message">
            Type your message
          </label>
          <textarea
            id="chat-message"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                if (!isSending) {
                  event.currentTarget.form?.requestSubmit();
                }
              }
            }}
            placeholder="Ask a question, request a summary, or continue the thread..."
            rows={3}
            className="w-full resize-none rounded-2xl border border-transparent bg-transparent px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
          />

          <div className="flex items-center justify-between gap-3 px-1">
            <button
              type="submit"
              disabled={!draft.trim() || isSending}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors cursor-pointer",
                draft.trim() && !isSending
                  ? "bg-primary-500 text-white hover:bg-primary-600"
                  : "cursor-not-allowed bg-muted text-muted-foreground",
              )}
            >
              {isSending ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <SendHorizontal className="size-4" />
              )}
              Send
            </button>
          </div>
        </div>
      </form>
    </footer>
  );
}
