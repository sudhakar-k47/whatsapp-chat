// useChatStore.js
import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUserLoading: false,
  isMessagesLoading: false,
  typingUsers: [],
  unreadCounts: {},
  messagesSubscribed: false,

  // Fetch users
  getUsers: async () => {
    set({ isUserLoading: true });
    try {
      const response = await axiosInstance.get("/message/users");
      const users = Array.isArray(response.data)
        ? response.data.map((u) => ({ ...u }))
        : [];
      const unread = {};
      users.forEach((u) => {
        unread[u._id] = u.unreadCount || 0;
      });
      set({ users, unreadCounts: unread });
    } catch {
      toast.error("Failed to load users");
    } finally {
      set({ isUserLoading: false });
    }
  },

  // Fetch messages for selected user
  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const response = await axiosInstance.get(`/message/${userId}`);
      set({ messages: response.data });
      if (userId) {
        get().clearUnread(userId);
      }
    } catch {
      toast.error("Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  // Set selected user and clear unread count
  setSelectedUser: (selectedUser) => {
    set({ selectedUser });
    if (selectedUser?._id) {
      get().clearUnread(selectedUser._id);
    }
  },

  // Send message
  sendMessage: async (messageData, options = {}) => {
    const { selectedUser } = get();
    const socket = useAuthStore.getState().socket;
    if (!selectedUser) {
      toast.error("No user selected");
      return;
    }
    try {
      const response = await axiosInstance.post(
        `/message/send/${selectedUser._id}`,
        messageData
      );
      set((state) => ({
        messages: [...state.messages, response.data],
        users: state.users
          .map((u) =>
            u._id === selectedUser._id
              ? { ...u, lastMessageAt: response.data.createdAt }
              : u
          )
          .sort(
            (a, b) =>
              new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0)
          ),
      }));
      if (socket?.connected) {
        socket.emit("sendMessage", {
          ...response.data,
          receiverId: selectedUser._id,
        });
      }
      if (options.previousMessage) {
        toast.success("Previous message sent!");
      }
    } catch {
      toast.error("Failed to send message");
    }
  },

  // Typing state handling
  setTypingUsers: (typingUsers) => set({ typingUsers }),

  isUserTyping: (userId) => {
    const { typingUsers } = get();
    return typingUsers.some((id) => id?.toString() === userId?.toString());
  },

  initializeTypingListeners: () => {
    const handleTypingUsersUpdate = (event) => {
      set({ typingUsers: event.detail });
    };
    const handleUserTypingUpdate = (event) => {
      const { userId, isTyping } = event.detail;
      const currentTypingUsers = get().typingUsers;
      if (
        isTyping &&
        !currentTypingUsers.some((id) => id?.toString() === userId?.toString())
      ) {
        set({ typingUsers: [...currentTypingUsers, userId] });
      } else if (
        !isTyping &&
        currentTypingUsers.some((id) => id?.toString() === userId?.toString())
      ) {
        set({
          typingUsers: currentTypingUsers.filter(
            (id) => id?.toString() !== userId?.toString()
          ),
        });
      }
    };
    window.addEventListener("typingUsersUpdate", handleTypingUsersUpdate);
    window.addEventListener("userTypingUpdate", handleUserTypingUpdate);
    return () => {
      window.removeEventListener("typingUsersUpdate", handleTypingUsersUpdate);
      window.removeEventListener("userTypingUpdate", handleUserTypingUpdate);
    };
  },

  // Socket subscription for new messages
  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket || !socket.connected) return; // wait until socket is connected
    if (get().messagesSubscribed) return;
    socket?.off("newMessage");
    socket?.on("newMessage", (newMessage) => {
      const { selectedUser, incrementUnread, messages } = get();

      // If message is for the selected chat, add it to messages
      if (
        selectedUser &&
        (newMessage.senderId === selectedUser._id ||
          newMessage.receiverId === selectedUser._id)
      ) {
        set({ messages: [...messages, newMessage] });
      } else {
        // Otherwise, increase unread count for sender (optimistic)
        incrementUnread(newMessage.senderId);
      }
    });

    // Listen for authoritative unread count updates from server
    socket?.off("unreadCountUpdate");
    socket?.on("unreadCountUpdate", ({ from, count }) => {
      console.debug("unreadCountUpdate received", { from, count });
      // set((state) => ({
      //   unreadCounts: {
      //     ...state.unreadCounts,
      //     [from]: count,
      //   },
      // }));
    });

    set({ messagesSubscribed: true });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket?.off("newMessage");
    socket?.off("unreadCountUpdate");
    set({ messagesSubscribed: false });
  },

  // Unread message count handling
  incrementUnread: (userId) =>
    set((state) => ({
      unreadCounts: {
        ...state.unreadCounts,
        [userId]: (state.unreadCounts[userId] || 0) + 1,
      },
    })),

  clearUnread: (userId) =>
    set((state) => ({
      unreadCounts: {
        ...state.unreadCounts,
        [userId]: 0,
      },
    })),
}));
