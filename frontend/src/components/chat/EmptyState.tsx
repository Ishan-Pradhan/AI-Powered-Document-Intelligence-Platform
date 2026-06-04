import { MessageSquarePlus } from "lucide-react";

interface EmptyStateProps {
  isNewChat: boolean;
  onSelectPrompt: (prompt: string) => void;
}

export function EmptyState({ isNewChat, onSelectPrompt }: EmptyStateProps) {
  const suggestedPrompts = [
    "Summarize the uploaded document in plain language.",
    "Find the most important points and missing details.",
    "Explain this content like I’m new to the topic.",
    "List the key action items and risks.",
  ];

  return (
    <div className="flex min-h-[calc(100vh-18rem)] flex-col items-center justify-center rounded-[2rem] border border-dashed border-border bg-linear-to-b from-muted/25 to-background px-6 py-12 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary-500/10 text-primary-600">
        <MessageSquarePlus className="size-7" />
      </div>
      <h2 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">
        {isNewChat ? "Start a new conversation" : "This thread is empty"}
      </h2>
      <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
        {isNewChat
          ? "Type a question below and the assistant will create a new conversation automatically."
          : "Send a message to continue this conversation. The assistant will answer in the same thread."}
      </p>

      <div className="mt-6 grid w-full max-w-2xl gap-3 sm:grid-cols-2">
        {suggestedPrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onSelectPrompt(prompt)}
            className="rounded-2xl border border-border bg-background px-4 py-3 text-left text-sm text-foreground transition-colors hover:border-primary-500/30 hover:bg-muted/40 cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
