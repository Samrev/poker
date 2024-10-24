const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("a user connected", socket.id);

    socket.on("joinRoom", ({ roomId, guestId }) => {
      console.log(`Guest ${guestId} is joining room ${roomId}`);
      socket.join(roomId);
      socket.to(roomId).emit("playerJoined", { guestId });
    });

    socket.on("leaveRoom", ({ roomId, guestId }) => {
      console.log(`Guest ${guestId} is leaving room ${roomId}`);
      socket.leave(roomId);
      socket.to(roomId).emit("playerLeft", { guestId });
    });

    socket.on("toogleReadinessStatus", ({ roomId, guestId }) => {
      console.log(`Guest ${guestId} in room ${roomId} has toggled readiness`);
      io.to(roomId).emit("readyStatusChanged", { guestId });
    });

    socket.on("startGame", ({ roomId, guestId }) => {
      console.log(`Guest ${guestId} has started the game in ${roomId}`);
      socket.to(roomId).emit("gameStarted", { roomId });
    });
  });
};

export default socketHandler;
