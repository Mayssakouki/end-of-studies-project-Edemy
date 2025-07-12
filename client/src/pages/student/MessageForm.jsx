import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  useSendMessageMutation,
  useGetMessagesQuery,
  useEditMessageMutation,
  useDeleteMessageMutation,
} from "@/features/api/messageApi";
import { useLoadUserQuery } from "@/features/api/authApi";

const MessageForm = ({ courseId }) => {
  const [content, setContent] = useState("");
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();
  const { data: messages, isLoading: messagesLoading, isError } = useGetMessagesQuery(courseId);
  const [editMessage, { isLoading: isEditing }] = useEditMessageMutation();
  const [deleteMessage, { isLoading: isDeleting }] = useDeleteMessageMutation();
  const { data: userData } = useLoadUserQuery();

  const messagesEndRef = useRef(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const currentUserId = userData?.user?._id;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    try {
      await sendMessage({ courseId, content }).unwrap();
      toast.success("Message sent successfully");
      setContent("");
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error(error?.data?.message || "Failed to send message");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey && content.trim() && !isSending) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEditMessage = (msg) => {
    setEditingMessageId(msg._id);
    setEditContent(msg.content);
  };

  const handleSaveEdit = async (messageId) => {
    try {
      await editMessage({ messageId, content: editContent }).unwrap();
      toast.success("Message updated successfully");
      setEditingMessageId(null);
      setEditContent("");
    } catch (error) {
      console.error("Failed to update message:", error);
      toast.error(error?.data?.message || "Failed to update message");
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditContent("");
  };

  const handleDeleteMessage = async (messageId) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      try {
        await deleteMessage(messageId).unwrap();
        toast.success("Message deleted successfully");
      } catch (error) {
        console.error("Failed to delete message:", error);
        toast.error(error?.data?.message || "Failed to delete message");
      }
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Course Discussion</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="message-input">Message</Label>
            <Input
              id="message-input"
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
              disabled={isSending}
              className="mt-1"
            />
          </div>
          <Button
            disabled={isSending || !content.trim()}
            onClick={handleSendMessage}
            className="w-full sm:w-auto"
          >
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Message"
            )}
          </Button>
          <div className="mt-4">
            <h3 className="font-semibold text-lg mb-2">History</h3>
            {messagesLoading ? (
              <p className="text-gray-500">Loading messages...</p>
            ) : isError ? (
              <p className="text-red-500">Failed to load messages</p>
            ) : !messages?.messages || messages.messages.length === 0 ? (
              <p className="text-gray-500">No messages yet.</p>
            ) : (
              <div className="max-h-96 overflow-y-auto pr-2">
                <ul className="space-y-4">
                  {messages.messages.map((msg) => {
                    const isSentByCurrentUser = msg.senderId?._id === currentUserId;

                    return (
                      <li key={msg._id} className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={msg.senderId?.photoURL || "https://github.com/shadcn.png"}
                            alt={msg.senderId?.name || "User"}
                          />
                          <AvatarFallback>
                            {msg.senderId.name?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <p className="font-medium text-sm">{msg.senderId.name}</p>
                            <div className="text-right ml-4">
                              <p className="text-xs text-gray-500">
                                {new Date(msg.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            {editingMessageId === msg._id ? (
                              <div className="flex-1">
                                <Input
                                  type="text"
                                  value={editContent}
                                  onChange={(e) => setEditContent(e.target.value)}
                                  placeholder="Edit your message..."
                                  className="mb-1"
                                />
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    onClick={() => handleSaveEdit(msg._id)}
                                    disabled={isEditing || !editContent.trim()}
                                  >
                                    {isEditing ? (
                                      <>
                                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                        Saving...
                                      </>
                                    ) : (
                                      "Save"
                                    )}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCancelEdit}
                                    disabled={isEditing}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-800 dark:text-gray-200 flex-1">
                                {msg.content}
                              </p>
                            )}
                            {isSentByCurrentUser && editingMessageId !== msg._id && (
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditMessage(msg)}
                                  disabled={isEditing || isDeleting}
                                  className="p-1 h-6"
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteMessage(msg._id)}
                                  disabled={isEditing || isDeleting}
                                  className="p-1 h-6"
                                >
                                  Delete
                                </Button>
                              </div>
                            )}
                          </div>
                          {msg.isRead && !editingMessageId && (
                            <p className="text-xs text-green-500 mt-1">Read</p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MessageForm;