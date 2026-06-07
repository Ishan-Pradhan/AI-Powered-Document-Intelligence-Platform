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
let globalGuestAuthPromise: ReturnType<typeof guestLogin> | null = null;

export function useWidgetChat({ documentId, ssoToken }: UseWidgetChatProps) {
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);

  // Tracks whether the backend has confirmed a valid session this lifecycle
  const sessionReady = useRef(false);
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
            // No stored session — clear stale Zustand state and defer guest login
            // until the user sends their first message.
            clearUser();
            setAuthLoading(false);
            return;
          }

          try {
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
                  localStorage.removeItem("docintel_guest_user_id");
                  throw err;
                });
            }

            const res = await globalGuestAuthPromise;
            activeUser = res.data.data;
          } catch (loginErr) {
            console.warn("Stored guest session expired or deleted, reverting to anonymous state:", loginErr);
            setAuthLoading(false);
            return;
          }
        }

        if (cancelled) return;

        if (activeUser) {
          setUser(activeUser);
          sessionReady.current = true;

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
      } catch (err: unknown) {
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

    // Lazily log in the guest user if no server-confirmed session exists yet
    if (!sessionReady.current) {
      try {
        const res = await guestLogin();
        const activeUser = res.data.data;
        if (activeUser) {
          localStorage.setItem("docintel_guest_user_id", activeUser.id);
          setUser(activeUser);
          sessionReady.current = true;
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
    } catch (error: unknown) {
      // If the backend rejected the request because the guest session was
      // deleted (401), transparently create a new guest and retry the message.
      const status =
        (error as { response?: { status?: number } })?.response?.status;

      if (status === 401) {
        console.warn("Guest session expired mid-session, creating a new guest and retrying...");
        try {
          sessionReady.current = false;
          localStorage.removeItem("docintel_guest_user_id");
          clearUser();
          setActiveChatId(undefined);

          const res = await guestLogin();
          const activeUser = res.data.data;
          if (activeUser) {
            localStorage.setItem("docintel_guest_user_id", activeUser.id);
            setUser(activeUser);
            sessionReady.current = true;
          }

          const retryResponse = await sendMessageMutation.mutateAsync({
            message,
            chatId: undefined,
            documentId,
          });

          if (retryResponse.chatId) {
            setActiveChatId(retryResponse.chatId);
          }

          const retryAssistantMessage: UiMessage = {
            id: `assistant-${Date.now()}`,
            chatId: retryResponse.chatId,
            role: "assistant",
            content: retryResponse.answer,
            sourcesUsed: retryResponse.sourcesUsed,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          setMessages((prev) =>
            prev
              .map((item) =>
                item.id === optimisticUserMessage.id
                  ? { ...item, chatId: retryResponse.chatId, optimistic: false }
                  : item,
              )
              .concat(retryAssistantMessage),
          );
          return;
        } catch (retryErr) {
          console.error("Retry after session reset failed:", retryErr);
        }
      }

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
