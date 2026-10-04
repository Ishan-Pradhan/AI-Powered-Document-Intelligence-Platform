import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { type ChatSource } from "@/api/chat";
import { type UiMessage } from "@/hooks/chats/useWidgetChat";
import { MarkdownContent } from "../MarkdownContent";

interface MessageAvatarProps {
  role: UiMessage["role"];
}

function MessageAvatar({ role }: MessageAvatarProps) {
  const user = useAuthStore((state) => state.user);
  return role === "assistant" ? (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-500/15 text-primary-600 transition-all duration-300 hover:scale-105">
      <Bot className="size-3.5" />
    </div>
  ) : (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-full overflow-hidden bg-primary-100 ring-2 ring-primary-500/10 transition-all duration-300 hover:scale-105">
      {user?.avatarUrl ? (
        <img
          src={user.avatarUrl}
          alt="user avatar"
          className="size-full object-cover"
        />
      ) : (
        <span className="text-xs font-semibold text-primary-700">
          {(user?.name || "U")[0].toUpperCase()}
        </span>
      )}
    </div>
  );
}

interface SourcePillsProps {
  sources?: ChatSource[];
}

function SourcePills({ sources }: SourcePillsProps) {
  if (!sources?.length) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-1.5 animate-in fade-in slide-in-from-bottom-1 duration-300">
      {sources.slice(0, 3).map((source) => (
        <span
          key={source.chunkId}
          className="rounded-md border border-border bg-background/50 backdrop-blur-xs px-2 py-0.5 text-[10px] font-medium text-muted-foreground transition-all hover:bg-muted"
        >
          {source.documentTitle}
        </span>
      ))}
    </div>
  );
}

interface WidgetChatBubbleProps {
  message: UiMessage;
}

export function WidgetChatBubble({ message }: WidgetChatBubbleProps) {
  const isAssistant = message.role === "assistant";

  return (
    <div
      className={cn(
        "flex gap-2.5 animate-in fade-in-50 duration-300",
        isAssistant ? "justify-start slide-in-from-left-2" : "justify-end slide-in-from-right-2",
      )}
    >
      {isAssistant && <MessageAvatar role={message.role} />}

      <div
        className={cn(
          "max-w-[85%] rounded-2xl border px-3.5 py-2.5 shadow-xs transition-all duration-200",
          isAssistant
            ? "border-border bg-card text-card-foreground hover:shadow-sm"
            : "border-primary-500/20 bg-primary-500 text-primary-foreground hover:bg-primary-600",
          message.optimistic && "opacity-80 animate-pulse",
        )}
      >
        <MarkdownContent content={message.content} isUser={!isAssistant} />
        {isAssistant && <SourcePills sources={message.sourcesUsed} />}
      </div>

      {!isAssistant && <MessageAvatar role={message.role} />}
    </div>
  );
}
