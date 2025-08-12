import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  }
});

const userSocketMap = {};
const userTypingMap = {};

export function getReceiversSocketId(userId) {
  return userSocketMap[userId] || [];
}

export function getTypingUsers() {
  const now = Date.now();
  return Object.entries(userTypingMap)
    .filter(([_, { typing, timestamp }]) => typing && (now - timestamp <= 3000))
    .map(([userId]) => userId);
}

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (!userId || userId === "undefined") return;

  if (!userSocketMap[userId]) userSocketMap[userId] = [];
  userSocketMap[userId].push(socket.id);

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.emit("testConnection", { message: "Socket connected successfully", userId });

  socket.on("typing", ({ receiverId, isTyping }) => {
    userTypingMap[userId] = { typing: isTyping, timestamp: Date.now() };

    const receiverSocketIds = getReceiversSocketId(receiverId);
    receiverSocketIds.forEach(id =>
      io.to(id).emit("userTyping", { userId, isTyping })
    );

    io.emit("typingUsers", getTypingUsers());
  });

  socket.on("disconnect", () => {
    if (userId && userSocketMap[userId]) {
      userSocketMap[userId] = userSocketMap[userId].filter(id => id !== socket.id);
      if (userSocketMap[userId].length === 0) {
        delete userSocketMap[userId];
        delete userTypingMap[userId];
      }
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    io.emit("typingUsers", getTypingUsers());
  });
});

export { io, app, server, userSocketMap };
