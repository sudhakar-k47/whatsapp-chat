import { X } from "lucide-react"
import { useAuthStore } from "../store/useAuthStore"
import { useChatStore } from "../store/useChatStore"

import useMediaQuery from "../hooks/useMediaQuery";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, isUserTyping } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const isMobile = useMediaQuery("(max-width: 750px)");

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between gap-2">
        <div className={`flex items-center gap-3 min-w-0 ${isMobile ? "mt-5" : ""}`}>
          {/* Mobile Back Button */}
          {isMobile && (
            <button
              onClick={() => setSelectedUser(null)}
              className="btn btn-ghost btn-circle hover:bg-base-300 mr-1"
              aria-label="Back"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
          )}
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
            </div>
          </div>
          {/* User info */}
          <div className="min-w-0">
            <h3 className="font-medium truncate text-base sm:text-lg">{selectedUser.fullName}</h3>
            <p className="text-xs sm:text-sm text-base-content/70 truncate">
              {isUserTyping(selectedUser._id) ? (
                <span className="flex items-center gap-1">
                  <span className="typing-indicator">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </span>
                  typing...
                </span>
              ) : (
                onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"
              )}
            </p>
          </div>
        </div>
        {/* Desktop Close Button (X) */}
        {!isMobile && (
          <button
            onClick={() => setSelectedUser(null)}
            className="btn btn-ghost btn-circle hover:bg-base-300"
            aria-label="Close"
          >
            <X />
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;
