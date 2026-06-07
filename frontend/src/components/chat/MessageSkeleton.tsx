import { cn } from "@/lib/utils";

// Shimmer base shared by all skeleton pieces
function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-500",
        className,
      )}
    />
  );
}

// Mirrors the MessageAvatar circle (size-9 rounded-full)
function SkeletonAvatar() {
  return <Shimmer className="size-9 shrink-0 rounded-full" />;
}

interface SkeletonBubbleProps {
  /** true = assistant (left-aligned), false = user (right-aligned) */
  isAssistant: boolean;
  /** widths of the fake text lines inside the bubble, e.g. ["w-48","w-36"] */
  lines: string[];
}

function SkeletonBubble({ isAssistant, lines }: SkeletonBubbleProps) {
  return (
    <div className={cn("flex gap-3", isAssistant ? "justify-start" : "justify-end")}>
      {isAssistant && <SkeletonAvatar />}

      {/* Bubble shell — mirrors ChatBubble exactly */}
      <div
        className={cn(
          "max-w-[min(42rem,calc(100vw-6rem))] rounded-2xl animate-pulse px-4 py-3 shadow-sm",
          isAssistant
            ? " bg-card"
            : " bg-gray-500",
        )}
      >
        <div className="flex flex-col gap-2">
          {lines.map((w, i) => (
            <Shimmer key={i} className={cn("h-3.5 rounded-full", w)} />
          ))}
        </div>

        {/* Source pills ghost (assistant only) */}
        {isAssistant && (
          <div className="mt-3 flex gap-2">
            <Shimmer className="h-5 w-20 rounded-full" />
            <Shimmer className="h-5 w-16 rounded-full" />
          </div>
        )}
      </div>

      {!isAssistant && <SkeletonAvatar />}
    </div>
  );
}

// A realistic-looking conversation skeleton: 3 exchanges
const SKELETON_PATTERN: { isAssistant: boolean; lines: string[] }[] = [
  { isAssistant: false, lines: ["w-48"] },
  { isAssistant: true,  lines: ["w-64", "w-52", "w-40"] },
  { isAssistant: false, lines: ["w-56", "w-36"] },
  { isAssistant: true,  lines: ["w-72", "w-60"] },
  { isAssistant: false, lines: ["w-44"] },
  { isAssistant: true,  lines: ["w-64", "w-48", "w-32"] },
];

export function MessageSkeleton() {
  return (
    <div className="space-y-4 pb-4">
      {SKELETON_PATTERN.map((item, i) => (
        <SkeletonBubble key={i} isAssistant={item.isAssistant} lines={item.lines} />
      ))}
    </div>
  );
}
