import { useMemo, useRef, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getChats, getChatMessages, sendChatMessage } from "@/api/chat";
import type { UiMessage } from "@/components/chat/ChatBubble";

export function useChatSession(chatId: string | undefined) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNewChat = !chatId;
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const threadKey = useMemo(
    () =>
      isNewChat ? ["chat-messages", "draft-thread"] : ["chat-messages", chatId],
    [isNewChat, chatId],
  );

  const chatsQuery = useQuery({
    queryKey: ["chats"],
    queryFn: getChats,
  });

  const messagesQuery = useQuery({
    queryKey: threadKey,
    queryFn: () => getChatMessages(chatId as string),
    enabled: Boolean(chatId),
  });

  const messages = (messagesQuery.data ?? []) as UiMessage[];
  const messageCount = messages.length;

  const sendMessageMutation = useMutation({
    mutationFn: sendChatMessage,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messageCount]);

  const currentChat = useMemo(
    () => chatsQuery.data?.find((chat) => chat.id === chatId),
    [chatId, chatsQuery.data],
  );

  const title = currentChat?.title ?? (isNewChat ? "New chat" : "Conversation");

  const handleSend = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const message = draft.trim();
    if (!message || sendMessageMutation.isPending) return;

    const optimisticUserMessage: UiMessage = {
      id: `optimistic-${Date.now()}`,
      chatId: chatId ?? "temp",
      role: "user",
      content: message,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      optimistic: true,
      sourcesUsed: [],
    };

    setDraft("");
    queryClient.setQueryData<UiMessage[]>(threadKey, (current = []) => [
      ...current,
      optimisticUserMessage,
    ]);

    try {
      const response = await sendMessageMutation.mutateAsync({
        message,
        chatId,
      });

      const assistantMessage: UiMessage = {
        id: `assistant-${Date.now()}`,
        chatId: response.chatId,
        role: "assistant",
        content: response.answer,
        sourcesUsed: response.sourcesUsed,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const existingThread =
        queryClient.getQueryData<UiMessage[]>(threadKey) ?? [];
      const updatedThread = existingThread
        .map((item) =>
          item.id === optimisticUserMessage.id
            ? { ...item, chatId: response.chatId, optimistic: false }
            : item,
        )
        .concat(assistantMessage);

      queryClient.setQueryData<UiMessage[]>(
        ["chat-messages", response.chatId],
        updatedThread,
      );

      if (isNewChat) {
        queryClient.removeQueries({ queryKey: threadKey, exact: true });
      }

      await queryClient.invalidateQueries({ queryKey: ["chats"] });
      await queryClient.invalidateQueries({
        queryKey: ["chat-messages", response.chatId],
      });

      if (isNewChat || chatId !== response.chatId) {
        navigate(`/chat/${response.chatId}`, { replace: true });
      }
    } catch (error: any) {
      console.error("Failed to send message:", error);
      const serverMessage =
        error?.response?.data?.message ||
        "Failed to generate answer. Please try again.";

      const errorAssistantMessage: UiMessage = {
        id: `assistant-error-${Date.now()}`,
        chatId: chatId ?? "temp",
        role: "assistant",
        content: `⚠️ ${serverMessage}`,
        sourcesUsed: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData<UiMessage[]>(threadKey, (current = []) => [
        ...current.map((item) =>
          item.id === optimisticUserMessage.id
            ? { ...item, optimistic: false }
            : item,
        ),
        errorAssistantMessage,
      ]);
    }
  };

  return {
    messages,
    isLoading: messagesQuery.isLoading,
    isError: messagesQuery.isError,
    isSending: sendMessageMutation.isPending,
    draft,
    setDraft,
    handleSend,
    bottomRef,
    isNewChat,
    title,
  };
}
