import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { type ChatMessage as ApiChatMessage, type ChatSource } from "@/api/chat";

export type UiMessage = ApiChatMessage & {
  optimistic?: boolean;
};

interface MessageAvatarProps {
  role: UiMessage["role"];
}

function MessageAvatar({ role }: MessageAvatarProps) {
  const user = useAuthStore((state) => state.user);
  return role === "assistant" ? (
    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-500/15 text-primary-600">
      <Bot className="size-4" />
    </div>
  ) : (
    <div className="flex size-9 shrink-0 items-center justify-center rounded-full overflow-hidden">
      <img
        src={user?.avatarUrl || undefined}
        alt="user avatar"
        className="size-full object-cover"
      />
    </div>
  );
}

interface SourcePillsProps {
  sources?: ChatSource[];
}

function SourcePills({ sources }: SourcePillsProps) {
  if (!sources?.length) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {sources.slice(0, 3).map((source) => (
        <span
          key={source.chunkId}
          className="rounded-full border border-border bg-background px-3 py-1 text-[11px] font-medium text-muted-foreground"
        >
          {source.documentTitle}
        </span>
      ))}
    </div>
  );
}

interface ChatBubbleProps {
  message: UiMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isAssistant = message.role === "assistant";

  return (
    <div
      className={cn(
        "flex gap-3",
        isAssistant ? "justify-start" : "justify-end",
      )}
    >
      {isAssistant && <MessageAvatar role={message.role} />}

      <div
        className={cn(
          "max-w-[min(42rem,calc(100vw-6rem))] rounded-2xl border px-4 py-3 shadow-sm",
          isAssistant
            ? "border-border bg-card text-card-foreground"
            : "border-primary-500/20 bg-primary-500 text-primary-foreground",
          message.optimistic && "opacity-80",
        )}
      >
        <p className="whitespace-pre-wrap text-sm leading-6">
          {message.content}
        </p>
        {isAssistant && <SourcePills sources={message.sourcesUsed} />}
        {message.optimistic && (
          <p className="mt-2 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            Sending...
          </p>
        )}
      </div>

      {!isAssistant && <MessageAvatar role={message.role} />}
    </div>
  );
}
