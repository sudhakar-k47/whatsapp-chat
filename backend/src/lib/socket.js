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

// Store multiple sockets per user
const userSocketMap = {}; // { userId: [socketId1, socketId2, ...] }

export function getReceiversSocketId(userId) {
    return userSocketMap[userId] || [];
}

io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (!userId || userId === "undefined") {
        console.warn(`⚠️ Socket ${socket.id} connected without a valid userId`);
        // Do not track or emit for invalid userId, but allow the connection (no disconnect)
        return;
    }
    console.log("🟢 New client connected:", socket.id);
    if (!userSocketMap[userId]) {
        userSocketMap[userId] = [];
    }
    userSocketMap[userId].push(socket.id);
    console.log(`User ${userId} connected. Sockets:`, userSocketMap[userId]);

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
        console.log("🔴 Client disconnected:", socket.id);

        if (userId && userSocketMap[userId]) {
            userSocketMap[userId] = userSocketMap[userId].filter(
                (id) => id !== socket.id
            );

            if (userSocketMap[userId].length === 0) {
                delete userSocketMap[userId];
            }

            console.log(`User ${userId} sockets:`, userSocketMap[userId] || "offline");
        }

        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

export { io, app, server, userSocketMap };
