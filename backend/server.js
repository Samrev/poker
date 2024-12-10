import connectDB from "./config/db.js";
import dotenv from "dotenv";
import { Server } from "socket.io";
import app from "./app.js";
import socketHandlers from "./sockets/index.js";

// Configure environment variables
dotenv.config();
const PORT = process.env.PORT || 3000;

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
