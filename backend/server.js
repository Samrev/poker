import express from "express";
import guestRoutes from "./routes/guestRoutes.js";
import cors from "cors";
import roomRoutes from "./routes/roomRoutes.js";
import connectDB from "./connect.js";
import dotenv from "dotenv";
import { Server } from "socket.io";

dotenv.config();
const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use("/api/guests", guestRoutes);
app.use("/api/rooms", roomRoutes);

connectDB();

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
  },
});
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
    console.log(`Guest ${guestId} is room ${roomId} has toggled readiness`);
    io.to(roomId).emit("readyStatusChanged", { guestId });
  });
});

export default io;
