import { deleteChat, getChats, renameChat } from "@/api/chat";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function useChatHistory() {
  const queryClient = useQueryClient();

  const navigate = useNavigate();

  const chatsQuery = useQuery({
    queryKey: ["chats"],
    queryFn: getChats,
  });

  const renameMutation = useMutation({
    mutationFn: ({ chatId, title }: { chatId: string; title: string }) =>
      renameChat(chatId, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      toast.success("Chat renamed successfully");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteChat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      navigate("/chat");
      toast.success("Chat deleted successfully");
    },
  });

  return {
    ...chatsQuery,
    renameMutation,
    deleteMutation,
  };
}
