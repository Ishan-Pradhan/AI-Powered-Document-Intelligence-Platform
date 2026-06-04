import React from "react";
import { LoaderCircle, SendHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface WidgetChatInputProps {
  draft: string;
  setDraft: (val: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  isSending: boolean;
}

export function WidgetChatInput({
  draft,
  setDraft,
  onSubmit,
  isSending,
}: WidgetChatInputProps) {
  return (
    <footer className="border-t border-border/85 bg-card/90 p-3 backdrop-blur-md">
      <form onSubmit={onSubmit} className="w-full">
        <div className="relative rounded-2xl border border-border bg-background p-1.5 flex items-center gap-2 focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500 transition-all duration-200">
          <textarea
            id="widget-chat-message"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                if (!isSending && draft.trim()) {
                  event.currentTarget.form?.requestSubmit();
                }
              }
            }}
            placeholder="Type your message..."
            rows={1}
            className="w-full max-h-16 resize-none bg-transparent px-3 py-1.5 text-xs text-foreground outline-hidden placeholder:text-muted-foreground/75"
          />
          <button
            type="submit"
            disabled={!draft.trim() || isSending}
            className={cn(
              "inline-flex size-8 items-center justify-center rounded-xl transition-all duration-200 shrink-0 shadow-xs active:scale-95",
              draft.trim() && !isSending
                ? "bg-primary-500 text-white hover:bg-primary-600 cursor-pointer"
                : "bg-muted text-muted-foreground cursor-not-allowed",
            )}
          >
            {isSending ? (
              <LoaderCircle className="size-3.5 animate-spin" />
            ) : (
              <SendHorizontal className="size-3.5" />
            )}
          </button>
        </div>
      </form>
    </footer>
  );
}
