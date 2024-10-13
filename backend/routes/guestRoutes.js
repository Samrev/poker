import express from "express";
import {
  createGuest,
  leaveRoom,
  toggleReadyPlayer,
} from "../controllers/guestController.js";
const guestRoutes = express.Router();

guestRoutes.post("/", createGuest);
guestRoutes.put("/:guestId", toggleReadyPlayer);
guestRoutes.put("/leave/:roomId/:guestId", leaveRoom);
export default guestRoutes;
