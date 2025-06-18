import Match from "../models/Match.js";
import User from "../models/User.js";
import notificationService from "../services/notificationService.js";

const configureSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`⚡️ New client connected: ${socket.id}`);

    socket.on("joinMatchRoom", ({ matchId, userId }) => {
      socket.join(matchId);
      console.log(`User ${userId} joined match room ${matchId}`);
      io.to(matchId).emit("userJoined", { userId });
    });

    socket.on("sendMessage", async ({ matchId, senderId, content }) => {
      if (!matchId || !senderId || !content?.trim()) return;

      try {
        const match = await Match.findById(matchId).populate("users");
        if (!match) return;

        const message = {
          sender: senderId,
          content: content.trim(),
          timeStamp: new Date(),
        };

        match.messages.push(message);
        await match.save();

        io.to(matchId).emit("newMessage", { matchId, message });

        const recipient = match.users.find(
          (u) => u._id.toString() !== senderId
        );
        const sender = match.users.find((u) => u._id.toString() === senderId);

        const roomSockets = await io.in(matchId).fetchSockets();
        const recipientIsInRoom = roomSockets.some(
          (s) => s.data?.userId === recipient._id.toString()
        );

        io.to(recipient._id.toString()).emit("messageReceived", {
          matchId,
          message,
        });

        if (!recipientIsInRoom) {
          await notificationService.createNotification(
            recipient._id,
            "message",
            `New message from ${sender.name}`,
            { relatedUser: sender._id, matchId }
          );
        }

        for (const userId of match.users) {
          const user = await User.findById(userId);
          if (user) {
            user.messageCount += 1;
            await user.save();
          }
        }
      } catch (err) {
        console.error("Socket sendMessage error:", err);
      }
    });

    socket.on("typing", ({ matchId, userId }) => {
      socket.to(matchId).emit("userTyping", { userId });
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
};

export default configureSocket;
