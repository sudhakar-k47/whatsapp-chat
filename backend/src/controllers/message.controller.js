import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import mongoose from "mongoose";
import { io } from "../lib/socket.js"; // Ensure this is the socket.io server instance

// Store connected users: { userId: socketId }
const onlineUsers = new Map();

// Register a connected user
export const registerSocketUser = (userId, socketId) => {
    onlineUsers.set(userId.toString(), socketId);
};

// Remove a disconnected user
export const removeSocketUser = (socketId) => {
    for (const [userId, id] of onlineUsers.entries()) {
        if (id === socketId) {
            onlineUsers.delete(userId);
            break;
        }
    }
};

// Get receiver's socket ID
export const getReceiversSocketId = (receiverId) => {
    return onlineUsers.get(receiverId.toString()) || null;
};

// Get users for sidebar with their last message
export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const myObjectId = new mongoose.Types.ObjectId(loggedInUserId);

        const usersWithLastMessage = await User.aggregate([
            // { $match: { _id: { $ne: myObjectId } } },
            {
                $lookup: {
                    from: "messages",
                    let: { otherId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $or: [
                                        {
                                            $and: [
                                                { $eq: ["$senderId", "$$otherId"] },
                                                { $eq: ["$receiverId", myObjectId] },
                                            ],
                                        },
                                        {
                                            $and: [
                                                { $eq: ["$senderId", myObjectId] },
                                                { $eq: ["$receiverId", "$$otherId"] },
                                            ],
                                        },
                                    ],
                                },
                            },
                        },
                        { $sort: { createdAt: -1 } },
                        { $limit: 1 },
                    ],
                    as: "lastMessage",
                },
            },
            {
                $addFields: {
                    lastMessageAt: {
                        $ifNull: [{ $arrayElemAt: ["$lastMessage.createdAt", 0] }, new Date(0)],
                    },
                },
            },
            { $sort: { lastMessageAt: -1, updatedAt: -1 } },
            { $project: { password: 0, lastMessage: 0 } },
        ]);

        return res.status(200).json(usersWithLastMessage);
    } catch (error) {
        console.error("Error fetching users for sidebar:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

// Get all messages between two users
export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId }
            ]
        }).sort({ createdAt: 1 }); // Oldest first

        return res.status(200).json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

// Send message (text or image)
export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        let imageUrl = null;

        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image, {
                resource_type: "image"
            });
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = await Message.create({
            text,
            image: imageUrl,
            senderId,
            receiverId
        });

        // Emit to receiver if online
        const receiverSocketId = getReceiversSocketId(receiverId);

        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        return res.status(201).json(newMessage);
    } catch (error) {
        console.error("Error sending message:", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
