import { getReceiversSocketId, io } from "../lib/socket.js";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import mongoose from "mongoose";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const myObjectId = new mongoose.Types.ObjectId(loggedInUserId);

    const usersWithLastMessage = await User.aggregate([
      { $match: { _id: { $ne: myObjectId } } },
      {
        $lookup: {
          from: "messages",
          let: { otherId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $and: [{ $eq: ["$senderId", "$$otherId"] }, { $eq: ["$receiverId", myObjectId] }] },
                    { $and: [{ $eq: ["$senderId", myObjectId] }, { $eq: ["$receiverId", "$$otherId"] }] }
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
          lastMessageAt: { $ifNull: [{ $arrayElemAt: ["$lastMessage.createdAt", 0] }, new Date(0)] },
        },
      },
      { $sort: { lastMessageAt: -1, updatedAt: -1 } },
      { $project: { password: 0, lastMessage: 0 } },
    ]);

    // Add unread count for each user
    for (let user of usersWithLastMessage) {
      user.unreadCount = await Message.countDocuments({
        senderId: user._id,
        receiverId: myObjectId,
        isRead: false
      });
    }

    return res.status(200).json(usersWithLastMessage);
  } catch (error) {
    console.error("Error fetching users for sidebar:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    await Message.updateMany(
      { senderId: userToChatId, receiverId: myId, isRead: false },
      { $set: { isRead: true } }
    );

    // Notify all my active sockets to reset unread count for this user
    try {
      const mySocketIds = getReceiversSocketId(myId);
      mySocketIds.forEach((socketId) => {
        io.to(socketId).emit("unreadCountUpdate", { from: userToChatId, count: 0 });
      });
    } catch (e) {
      console.warn("Failed to emit unread reset:", e?.message || e);
    }

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId }
      ]
    }).sort({ createdAt: 1 });

    return res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image, { resource_type: "image" });
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = await Message.create({
      text,
      image: imageUrl,
      senderId,
      receiverId,
      isRead: false
    });

    const receiverSocketIds = getReceiversSocketId(receiverId);
    receiverSocketIds.forEach(socketId => {
      io.to(socketId).emit("newMessage", newMessage);
    });

    // Send unread count update
    const unreadCount = await Message.countDocuments({
      senderId,
      receiverId,
      isRead: false
    });
    receiverSocketIds.forEach(socketId => {
      io.to(socketId).emit("unreadCountUpdate", { from: senderId, count: unreadCount });
    });

    return res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error sending message:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
