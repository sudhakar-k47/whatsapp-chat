import { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const { messages, getMessages, isMessagesLoading, selectedUser, subscribeToMessages, unsubscribeFromMessages } = useChatStore();
  const { authUser } = useAuthStore();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
      subscribeToMessages();
      return () => unsubscribeFromMessages();
    }
  }, [selectedUser, getMessages]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <ChatHeader />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isMessagesLoading ? (
          Array(5).fill(null).map((_, idx) => <MessageSkeleton key={idx} />)
        ) : messages.length > 0 ? (
          messages.map((message) => {
            const isOwnMessage = message.senderId === authUser._id;
            return (
              <div
                key={message._id}
                className={`chat ${isOwnMessage ? "chat-end" : "chat-start"}`}
              >
                {/* Avatar */}
                <div className="chat-image avatar">
                  <div className="w-10 h-10 rounded-full border">
                    <img
                      src={
                        isOwnMessage
                          ? authUser.profilePic
                          : selectedUser?.profilePic || "/avatar.png"
                      }
                      alt="User Avatar"
                    />
                  </div>
                </div>

                {/* Message Content */}
                <div className="chat-bubble max-w-xs break-words">
                  {message.text && (
                    <p className="mb-1 whitespace-pre-line">{message.text}</p>
                  )}
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Sent media"
                      className="rounded-lg max-w-[200px] border border-base-300"
                    />
                  )}
                </div>

                {/* Timestamp */}
                <div className="chat-footer opacity-50 text-xs mt-1">
                  <time dateTime={message.createdAt}>
                    {formatMessageTime(message.createdAt)}
                  </time>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center text-gray-400 mt-10">
            No messages yet. Send a message or share an image 📸
          </div>
        )}
        {/* Scroll target */}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-base-300 p-3">
        <MessageInput />
      </div>
    </div>
  );
};

export default ChatContainer;
