import { MessageSquarePlus } from "lucide-react";

export function WidgetEmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center p-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex size-11 items-center justify-center rounded-xl bg-muted/40 text-muted-foreground/80">
        <MessageSquarePlus className="size-5.5" />
      </div>
      <h2 className="mt-3.5 text-xs font-medium text-foreground">
        Ask AI 
      </h2>
      <p className="mt-1.5 max-w-[240px] text-[11px] text-muted-foreground/85 leading-relaxed">
        Ask questions, seek clarification, or request summaries.
      </p>
    </div>
  );
}
