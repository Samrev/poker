const socketPokerHandler = (io) => {
  io.of("/poker").on("connection", (socket) => {
    console.log("a user connected in poker", socket.id);

    socket.on("joinPoker", ({ roomId, guestId }) => {
      console.log(`Guest ${guestId} is joining poker ${roomId} - ${socket.id}`);
      socket.join(roomId);
    });

    socket.on("playerMoved", ({ roomId, guestId }) => {
      console.log(
        `Guest ${guestId} is made his move in ${roomId}-${socket.id}`
      );
      io.of("/poker").to(roomId).emit("pokerStatusChanged", { guestId });
    });
  });
};

export default socketPokerHandler;
