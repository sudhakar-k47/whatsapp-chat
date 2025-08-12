import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client"; // ✅ import socket.io client

const BASE_URL = import.meta.env.MODE === 'development' ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false, // ✅ fixed typo
  isUpdatingProfile: false,
  onlineUsers: [],
  socket: null,
  isCheckingAuth: true,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      set({ authUser: null });
      console.error("Error checking authentication:", error);
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (userData) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", userData);
      set({ authUser: res.data?.user });
      toast.success("Sign up successful!");
      get().connectSocket();
    } catch (error) {
      console.error("Error signing up:", error);
      toast.error(error.response?.data?.message || "Sign up failed");
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (credentials) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", credentials);
      set({ authUser: res.data?.user });
      toast.success("Login successful!");
      get().connectSocket();
    } catch (error) {
      console.error("Error logging in:", error);
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logout successful!");
      get().disconnectSocket();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  },

  updateProfile: async (profileData) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", profileData);
      set({ authUser: res.data?.user });
      toast.success(res.data?.message || "Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile.");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser, socket } = get();
    if (!authUser || socket?.connected) return; // ✅ safe check

    const newSocket = io(BASE_URL, {
      query: { userId: authUser._id },
    });

    newSocket.on("getOnlineUsers", (userIds) => {
      console.log("✅ Socket connected:", newSocket.id);
      set({ onlineUsers: userIds });
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });

    set({ socket: newSocket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },
}));
