import Match from "../models/Match.js";

const configureSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("join match", ({ matchId }) => {
      if (!matchId) {
        console.warn("❗ matchId missing in 'join match'");
        return;
      }

      socket.join(matchId);
      console.log(`User ${socket.id} joined match room ${matchId}`);
    });

    socket.on("chat message", async ({ matchId, senderId, content }) => {
      try {
        if (!matchId || !senderId || !content?.trim()) {
          console.warn("❗ Invalid chat message payload", {
            matchId,
            senderId,
            content,
          });
          return;
        }

        const newMessage = {
          sender: senderId,
          content: content.trim(),
          timeStamp: new Date(),
        };

        const match = await Match.findById(matchId);
        if (!match) {
          console.error(`Match ${matchId} not found`);
          return;
        }

        match.messages.push(newMessage);
        await match.save();

        io.to(matchId).emit("chat message", { ...newMessage, matchId });

        console.log(`Message saved & sent to match ${matchId}`);
      } catch (error) {
        console.error("Error handling chat message:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

export default configureSocket;
