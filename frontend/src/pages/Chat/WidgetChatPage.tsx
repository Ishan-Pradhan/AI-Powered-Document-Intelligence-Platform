import { useSearchParams } from "react-router-dom";
import { LoaderCircle } from "lucide-react";
import { useWidgetChat } from "@/hooks/chats/useWidgetChat";
import { WidgetChatHeader } from "@/components/chat/widget/WidgetChatHeader";
import { WidgetChatBubble } from "@/components/chat/widget/WidgetChatBubble";
import { WidgetChatInput } from "@/components/chat/widget/WidgetChatInput";
import { WidgetEmptyState } from "@/components/chat/widget/WidgetEmptyState";
import { WidgetLoadingState, WidgetErrorState } from "@/components/chat/widget/WidgetStates";

export default function WidgetChatPage() {
  const [searchParams] = useSearchParams();
  const documentId = searchParams.get("documentId") || undefined;
  const ssoToken = searchParams.get("sso_token") || searchParams.get("ssoToken");

  const {
    authLoading,
    authError,
    messages,
    draft,
    setDraft,
    handleSend,
    isSending,
    bottomRef,
  } = useWidgetChat({ documentId, ssoToken });

  if (authLoading) {
    return <WidgetLoadingState />;
  }

  if (authError) {
    return <WidgetErrorState error={authError} />;
  }

  return (
    <div className="flex h-screen w-screen flex-col bg-background font-sans">
      <WidgetChatHeader />

      <main className="min-h-0 flex-1 overflow-y-auto px-4 py-4 scrollbar-thin">
        {messages.length === 0 ? (
          <WidgetEmptyState />
        ) : (
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <WidgetChatBubble key={message.id} message={message} />
            ))}
            {isSending && (
              <div className="flex items-center gap-2.5 text-xs text-muted-foreground animate-pulse pl-1">
                <div className="flex size-8 items-center justify-center rounded-full bg-primary-500/10 text-primary-600">
                  <LoaderCircle className="size-3.5 animate-spin" />
                </div>
                <span>Typing...</span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </main>

      <WidgetChatInput
        draft={draft}
        setDraft={setDraft}
        onSubmit={handleSend}
        isSending={isSending}
      />
    </div>
  );
}
