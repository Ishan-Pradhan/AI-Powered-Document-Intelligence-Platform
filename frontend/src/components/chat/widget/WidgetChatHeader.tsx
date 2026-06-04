import { Bot } from "lucide-react";

export function WidgetChatHeader() {
  return (
    <header className="border-b border-border/85 bg-card/90 px-4 py-3 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="flex size-7 items-center justify-center rounded-lg bg-primary-500 text-white shadow-xs">
          <Bot className="size-4" />
        </div>
        <div>
          <h1 className="text-xs font-semibold text-foreground tracking-tight">
            Document Assistant
          </h1>
        </div>
      </div>
    </header>
  );
}
