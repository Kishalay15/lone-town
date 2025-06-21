import Match from "../models/Match.js";
import User from "../models/User.js";
import notificationService from "../services/notificationService.js";
import messageService from "../services/messageService.js";

const configureSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`New client connected`);

    socket.on("joinMatchRoom", async ({ matchId, userId }) => {
      socket.data.userId = userId;
      socket.join(matchId);

      await messageService.markMessagesAsRead(matchId, userId);

      console.log(`User joined match room ${matchId}`);
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
          timestamp: new Date(),
        };

        match.messages.push(message);

        match.unreadCounts = match.unreadCounts || new Map();

        for (const u of match.users) {
          const uid = u._id.toString();
          if (uid !== senderId) {
            match.unreadCounts.set(uid, (match.unreadCounts.get(uid) || 0) + 1);
          }
        }

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
      console.log(`Client disconnected:`);
    });
  });
};

export default configureSocket;
