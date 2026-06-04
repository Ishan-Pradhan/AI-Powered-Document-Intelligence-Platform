import { LoaderCircle } from "lucide-react";

interface WidgetErrorStateProps {
  error: string;
}

export function WidgetLoadingState() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-background">
      <div className="relative flex items-center justify-center">
        <div className="absolute size-12 rounded-full border-4 border-primary-500/20 animate-ping" />
        <LoaderCircle className="size-8 animate-spin text-primary-500" />
      </div>
      <p className="mt-4 text-xs font-medium text-muted-foreground animate-pulse">
        Loading...
      </p>
    </div>
  );
}

export function WidgetErrorState({ error }: WidgetErrorStateProps) {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-background p-4 text-center">
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-5 max-w-sm shadow-sm animate-in zoom-in-95 duration-200">
        <p className="text-sm font-semibold text-destructive mb-1">Connection Error</p>
        <p className="text-xs text-muted-foreground">{error}</p>
      </div>
    </div>
  );
}
