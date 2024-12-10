import express from "express";
import cors from "cors";
import guestRoutes from "./routes/guestRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import gameRoutes from "./routes/gameRoutes.js";
import ioInjector from "./middlewares/ioInjector.js";

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(ioInjector);

// Routes
app.use("/api/guests", guestRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/games", gameRoutes);

export default app;
