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

  sendMessage: async (messageData, options = {}) => {
    const { selectedUser } = get();
    const socket = useAuthStore.getState().socket;
    if (!selectedUser) {
      toast.error("No user selected");
      return;
    }
    try {
      // Send to backend (DB)
      const response = await axiosInstance.post(
        `/message/send/${selectedUser._id}`,
        messageData
      );
      set((state) => ({
        messages: [...state.messages, response.data],
      }));
      // Emit to socket for real-time delivery
      if (socket && socket.connected) {
        socket.emit("sendMessage", {
          ...response.data,
          receiverId: selectedUser._id,
        });
      }
      // Optionally, if sending a previous message
      if (options.previousMessage) {
        toast.success("Previous message sent!");
      }
    } catch (error) {
      toast.error("Failed to send message");
    }
  },

  subscribeToMessages: () => {
  const { selectedUser } = get();
  const socket = useAuthStore.getState().socket;
  if (!selectedUser || !socket) return;
  // Remove previous listeners to avoid duplicate handlers
  socket.off("newMessage");
  socket.on("newMessage", (newMessage) => {
    // Only add if message is for this chat
    if (
      (newMessage.senderId === selectedUser._id || newMessage.receiverId === selectedUser._id)
    ) {
      set({
        messages: [...get().messages, newMessage],
      });
    }
  });
},

unsubscribeFromMessages: () => {
  const socket = useAuthStore.getState().socket;
  if (socket) {
    socket.off("newMessage");
  }
}

}));
