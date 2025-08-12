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
      // Ensure we have a stable shape with lastMessageAt if backend provides it
      const users = Array.isArray(response.data)
        ? response.data.map((u) => ({ ...u }))
        : [];
      set({ users });
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
        users: state.users
          .map((u) =>
            u._id === selectedUser._id
              ? { ...u, lastMessageAt: response.data.createdAt }
              : u
          )
          // Optimistically sort so the conversation jumps to top
          .sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0)),
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
    const handleNewMessageReceived = (event) => {
      const newMessage = event.detail;
      // Update lastMessageAt for the counterpart user in this message
      const myId = useAuthStore.getState().authUser?._id || useAuthStore.getState().authUser?.id;
      const counterpartId = newMessage.senderId?.toString() === myId?.toString()
        ? newMessage.receiverId
        : newMessage.senderId;
      if (!counterpartId) return;
      set((state) => ({
        users: state.users
          .map((u) =>
            u._id === counterpartId ? { ...u, lastMessageAt: newMessage.createdAt } : u
          )
          .sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0)),
      }));
    };
    window.addEventListener('typingUsersUpdate', handleTypingUsersUpdate);
    window.addEventListener('userTypingUpdate', handleUserTypingUpdate);
    window.addEventListener('newMessageReceived', handleNewMessageReceived);
    return () => {
      window.removeEventListener('typingUsersUpdate', handleTypingUsersUpdate);
      window.removeEventListener('userTypingUpdate', handleUserTypingUpdate);
      window.removeEventListener('newMessageReceived', handleNewMessageReceived);
    };
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    const socket = useAuthStore.getState().socket;
    if (!selectedUser || !socket) return;
    socket.off("newMessage");
    socket.on("newMessage", (newMessage) => {
      if (newMessage.senderId === selectedUser._id || newMessage.receiverId === selectedUser._id) {
        set((state) => ({
          messages: [...state.messages, newMessage],
          users: state.users
            .map((u) =>
              u._id === selectedUser._id
                ? { ...u, lastMessageAt: newMessage.createdAt }
                : u
            )
            .sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0)),
        }));
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket?.off("newMessage");
  }
}));
