const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("a user connected", socket.id);

    socket.on("joinRoom", ({ roomId, guestId }) => {
      console.log(`Guest ${guestId} is joining room ${roomId}`);
      socket.join(roomId);
      socket.to(roomId).emit("roomStatusChanged", { guestId });
    });

    socket.on("leaveRoom", ({ roomId, guestId }) => {
      console.log(`Guest ${guestId} is leaving room ${roomId}`);
      socket.leave(roomId);
      socket.to(roomId).emit("roomStatusChanged", { guestId });
    });

    socket.on("toogleReadinessStatus", ({ roomId, guestId }) => {
      console.log(`Guest ${guestId} in room ${roomId} has toggled readiness`);
      io.to(roomId).emit("roomStatusChanged", { guestId });
    });

    socket.on("startGame", ({ roomId }) => {
      console.log(`Game has started in the room ${roomId}`);
      socket.to(roomId).emit("gameStarted", { roomId });
    });

    socket.on("playerMoved", ({ roomId }) => {
      console.log(`player has moved his turn in room ${roomId}`);
      io.to(roomId).emit("gameUpdated", { roomId });
    });
  });
};

export default socketHandler;
