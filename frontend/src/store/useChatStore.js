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

  getUsers: async () => {
    set({ isUserLoading: true });
    try {
      const response = await axiosInstance.get("/message/users");
      set({ users: response.data });
    } catch (error) {
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
    } catch (error) {
      toast.error("Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),

  sendMessage: async (messageData) => {
    const { selectedUser } = get();
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
    } catch (error) {
      toast.error("Failed to send message");
    }
  },

  subscribeToMessages: () => {
  const { selectedUser } = get();
  if (!selectedUser) {
    toast.error("No user selected");
    return;
  }

  const socket = useAuthStore.getState().socket;
  if (!socket) {
    console.warn("Socket not connected — cannot subscribe to messages.");
    return;
  }

  socket.on("newMessage", (newMessage) => {
    set({
      messages: [...get().messages, newMessage],
    });
  });
},

unsubscribeFromMessages: () => {
  const { selectedUser } = get();
  if (!selectedUser) {
    toast.error("No user selected");
    return;
  }

  const socket = useAuthStore.getState().socket;
  if (!socket) {
    console.warn("Socket not connected — cannot unsubscribe from messages.");
    return;
  }

  socket.off("newMessage");
}

}));
