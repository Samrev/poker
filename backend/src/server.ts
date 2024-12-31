import connectDB from "./config";
import dotenv from "dotenv";
import { Server } from "socket.io";
import app from "./app";
import socketHandlers from "./sockets";

// Configure environment variables
dotenv.config();
const PORT = process.env.PORT || 3001;

// Connect to database
connectDB();

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const io = new Server(server, {
  cors: {
    origin: `${process.env.FRONTEND_URL}`,
    methods: ["GET", "POST", "PUT"],
  },
});
socketHandlers(io);
