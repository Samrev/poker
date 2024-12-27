import express, { Request, Response } from "express";
import {
  createGuest,
  leaveRoom,
  toggleReadyPlayer,
} from "../controllers/guestController";

const guestRoutes = express.Router();

guestRoutes.post("/", (req: Request, res: Response) => {
  createGuest(req, res);
});

guestRoutes.put("/:guestId", (req: Request, res: Response) => {
  toggleReadyPlayer(req, res);
});

guestRoutes.put("/leave/:roomId/:guestId", (req: Request, res: Response) => {
  leaveRoom(req, res);
});

export default guestRoutes;
