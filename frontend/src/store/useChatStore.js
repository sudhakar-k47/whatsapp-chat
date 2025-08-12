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

  getUsers: async () => {
    set({ isUserLoading: true });
    try {
      const response = await axiosInstance.get("/message/users");
      set({ users: response.data });
    } catch {
      toast.error("Failed to load users");
    } finally {
      set({ isUserLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const response = await axiosInstance.get(`/message/${userId}`);
      set({ messages: response.data });
    } catch {
      toast.error("Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),

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

  setTypingUsers: (typingUsers) => set({ typingUsers }),

  isUserTyping: (userId) => {
    const { typingUsers } = get();
    return typingUsers.some(id => id?.toString() === userId?.toString());
  },

  initializeTypingListeners: () => {
    const handleTypingUsersUpdate = (event) => {
      set({ typingUsers: event.detail });
    };
    const handleUserTypingUpdate = (event) => {
      const { userId, isTyping } = event.detail;
      const currentTypingUsers = get().typingUsers;
      if (isTyping && !currentTypingUsers.some(id => id?.toString() === userId?.toString())) {
        set({ typingUsers: [...currentTypingUsers, userId] });
      } else if (!isTyping && currentTypingUsers.some(id => id?.toString() === userId?.toString())) {
        set({ typingUsers: currentTypingUsers.filter(id => id?.toString() !== userId?.toString()) });
      }
    };
    window.addEventListener('typingUsersUpdate', handleTypingUsersUpdate);
    window.addEventListener('userTypingUpdate', handleUserTypingUpdate);
    return () => {
      window.removeEventListener('typingUsersUpdate', handleTypingUsersUpdate);
      window.removeEventListener('userTypingUpdate', handleUserTypingUpdate);
    };
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    const socket = useAuthStore.getState().socket;
    if (!selectedUser || !socket) return;
    socket.off("newMessage");
    socket.on("newMessage", (newMessage) => {
      if (newMessage.senderId === selectedUser._id || newMessage.receiverId === selectedUser._id) {
        set({
          messages: [...get().messages, newMessage],
        });
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket?.off("newMessage");
  }
}));
