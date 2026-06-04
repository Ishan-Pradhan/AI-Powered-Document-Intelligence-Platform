import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Edit, EllipsisVertical, MessageCircle, Trash } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

import { toast } from "sonner";
import { useChatHistory } from "@/hooks/chats/useChatHistory";

type Chat = {
  id: string;
  title: string;
};

function ChatHistory({ collapsed }: { collapsed: boolean }) {
  const {
    data: chats = [],
    isLoading,
    renameMutation,
    deleteMutation,
  } = useChatHistory();

  // UI state only
  const [editingChat, setEditingChat] = useState<Chat | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const handleOpenRename = (chat: Chat) => {
    setEditingChat(chat);
    setRenameValue(chat.title);
  };

  const handleRename = () => {
    if (!editingChat) return;

    if (!renameValue.trim()) {
      toast.error("Title cannot be empty");
      return;
    }

    renameMutation.mutate(
      {
        chatId: editingChat.id,
        title: renameValue,
      },
      {
        onSuccess: () => {
          setEditingChat(null);
          setRenameValue("");
        },
      },
    );
  };

  return (
    <nav className="grid gap-1.5">
      {isLoading ? (
        <p className="text-xs text-muted-foreground px-2">Loading...</p>
      ) : (
        chats.map((chat: Chat) => (
          <NavLink
            key={chat.id}
            to={`/chat/${chat.id}`}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors
              ${
                isActive
                  ? "bg-primary-500/10 text-primary-600"
                  : "text-foreground hover:bg-muted"
              }
              ${collapsed ? "justify-center" : ""}`
            }
          >
            <div className="flex items-center gap-2 w-full">
              <MessageCircle className="size-3.5 shrink-0" />

              {!collapsed && <span>{chat.title}</span>}
            </div>

            {!collapsed && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <EllipsisVertical className="size-4 cursor-pointer" />
                </DropdownMenuTrigger>

                <DropdownMenuContent>
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>{chat.title}</DropdownMenuLabel>

                    {/* Rename */}
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault();
                        handleOpenRename(chat);
                      }}
                      className="cursor-pointer flex gap-4 items-center"
                    >
                      <Edit className="size-3.5 shrink-0" />
                      <span>Rename Conversation</span>
                    </DropdownMenuItem>

                    {/* Delete */}
                    <DropdownMenuItem
                      className="cursor-pointer flex gap-4 items-center"
                      onClick={() => deleteMutation.mutate(chat.id)}
                    >
                      <Trash className=" text-destructive size-3.5 shrink-0" />
                      <span className="text-destructive">
                        Delete Conversation
                      </span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </NavLink>
        ))
      )}

      {/* Rename Dialog */}
      <Dialog
        open={!!editingChat}
        onOpenChange={(open) => {
          if (!open) {
            setEditingChat(null);
            setRenameValue("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Conversation</DialogTitle>
          </DialogHeader>

          <Label>Title</Label>

          <Input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            placeholder="Enter new title"
          />

          <Button
            className="mt-4 w-full"
            onClick={handleRename}
            disabled={renameMutation.isPending}
          >
            {renameMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogContent>
      </Dialog>
    </nav>
  );
}

export default ChatHistory;
