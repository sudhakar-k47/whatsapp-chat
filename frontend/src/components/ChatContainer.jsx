import { useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import useMediaQuery from "../hooks/useMediaQuery";
import { useChatStore } from "../store/useChatStore";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    isUserTyping,
    setSelectedUser
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messagesEndRef = useRef(null);

  const isTyping = selectedUser ? isUserTyping(selectedUser._id) : false;

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
      subscribeToMessages();
      return () => unsubscribeFromMessages();
    }
  }, [selectedUser, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const isMobile = useMediaQuery("(max-width: 750px)");

  return (
    <div className="flex flex-col h-full w-full bg-base-100">
      <div className="sticky top-0 z-10 bg-base-100">
        {isMobile && (
          <button
            className="p-2 text-sm text-primary flex items-center gap-2 hover:bg-base-300 w-fit rounded-lg ml-2 mt-2 mb-1"
            onClick={() => setSelectedUser(null)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
            Back to chats
          </button>
        )}
        <ChatHeader />
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-4 scrollbar-thin scrollbar-thumb-base-300 scrollbar-track-base-200">
        {isMessagesLoading ? (
          Array(5)
            .fill(null)
            .map((_, idx) => <MessageSkeleton key={idx} />)
        ) : messages.length > 0 ? (
          messages.map((message) => {
            const isOwnMessage = message.senderId === authUser._id;
            return (
              <div
                key={message._id}
                className={`chat ${isOwnMessage ? "chat-end" : "chat-start"}`}
              >
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

        {isTyping && (
          <div className="chat chat-start">
            <div className="chat-image avatar">
              <div className="w-10 h-10 rounded-full border">
                <img
                  src={selectedUser?.profilePic || "/avatar.png"}
                  alt="Typing user"
                />
              </div>
            </div>
            <div className="chat-bubble max-w-[80px] flex items-center justify-center">
              <span className="typing-indicator text-base-content/70">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="sticky bottom-0 z-10 bg-base-100 border-t border-base-300 p-3">
        <MessageInput />
      </div>
    </div>
  );
};

export default ChatContainer;
