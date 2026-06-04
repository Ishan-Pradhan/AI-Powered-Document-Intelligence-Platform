import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  sendChatMessage,
  getChats,
  getChatMessages,
  type ChatMessage as ApiChatMessage,
} from "@/api/chat";
import { guestLogin, ssoLogin } from "@/api/auth";
import { useAuthStore } from "@/store/auth.store";

export type UiMessage = ApiChatMessage & {
  optimistic?: boolean;
};

interface UseWidgetChatProps {
  documentId?: string;
  ssoToken?: string | null;
}

// Module-level cache to deduplicate concurrent guest logins (e.g., React StrictMode double mounts)
let globalGuestAuthPromise: Promise<any> | null = null;

export function useWidgetChat({ documentId, ssoToken }: UseWidgetChatProps) {
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [activeChatId, setActiveChatId] = useState<string | undefined>(undefined);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const sendMessageMutation = useMutation({
    mutationFn: sendChatMessage,
  });

  const isRunning = useRef(false);

  // Authenticate Guest or SSO and load latest session on mount
  useEffect(() => {
    if (isRunning.current) return;
    isRunning.current = true;

    let cancelled = false;

    async function authenticateAndLoad() {
      try {
        setAuthLoading(true);
        let activeUser;

        if (ssoToken) {
          const res = await ssoLogin(ssoToken);
          activeUser = res.data.data;
        } else {
          const storedGuestId = localStorage.getItem("docintel_guest_user_id");
          if (!storedGuestId) {
            // Lazy initialization: Defer guest login until the first message is sent
            setAuthLoading(false);
            return;
          }
          
          if (!globalGuestAuthPromise) {
            globalGuestAuthPromise = guestLogin(storedGuestId)
              .then((res) => {
                const user = res.data.data;
                if (user) {
                  localStorage.setItem("docintel_guest_user_id", user.id);
                }
                globalGuestAuthPromise = null;
                return res;
              })
              .catch((err) => {
                globalGuestAuthPromise = null;
                throw err;
              });
          }
          
          const res = await globalGuestAuthPromise;
          activeUser = res.data.data;
        }

        if (cancelled) return;

        if (activeUser) {
          setUser(activeUser);

          const chatsList = await getChats();
          if (cancelled) return;

          if (chatsList && chatsList.length > 0) {
            const latestChat = chatsList[0];
            setActiveChatId(latestChat.id);

            const chatMessages = await getChatMessages(latestChat.id);
            if (cancelled) return;
            setMessages(chatMessages);
          }
        }
        setAuthError(null);
      } catch (err: any) {
        if (cancelled) return;
        console.error("Widget authentication failed:", err);
        setAuthError("Failed to initialize widget session.");
      } finally {
        if (!cancelled) setAuthLoading(false);
      }
    }

    authenticateAndLoad();

    return () => {
      cancelled = true;
      isRunning.current = false;
    };
  }, [ssoToken, setUser]);

  // Scroll to bottom when messages or sending state changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, sendMessageMutation.isPending]);

  const handleSend = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const message = draft.trim();
    if (!message || sendMessageMutation.isPending) return;

    // Lazily log in the guest user if no session exists yet
    if (!user) {
      try {
        const res = await guestLogin();
        const activeUser = res.data.data;
        if (activeUser) {
          localStorage.setItem("docintel_guest_user_id", activeUser.id);
          setUser(activeUser);
        }
      } catch (err) {
        console.error("Lazy guest login failed:", err);
        return;
      }
    }

    const optimisticUserMessage: UiMessage = {
      id: `optimistic-${Date.now()}`,
      chatId: activeChatId ?? "temp",
      role: "user",
      content: message,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      optimistic: true,
      sourcesUsed: [],
    };

    setDraft("");
    setMessages((prev) => [...prev, optimisticUserMessage]);

    try {
      const response = await sendMessageMutation.mutateAsync({
        message,
        chatId: activeChatId,
        documentId,
      });

      if (response.chatId && !activeChatId) {
        setActiveChatId(response.chatId);
      }

      const assistantMessage: UiMessage = {
        id: `assistant-${Date.now()}`,
        chatId: response.chatId,
        role: "assistant",
        content: response.answer,
        sourcesUsed: response.sourcesUsed,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setMessages((prev) =>
        prev
          .map((item) =>
            item.id === optimisticUserMessage.id
              ? { ...item, chatId: response.chatId, optimistic: false }
              : item,
          )
          .concat(assistantMessage),
      );
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages((prev) =>
        prev.filter((item) => item.id !== optimisticUserMessage.id),
      );
    }
  };

  return {
    authLoading,
    authError,
    messages,
    draft,
    setDraft,
    handleSend,
    isSending: sendMessageMutation.isPending,
    bottomRef,
  };
}
