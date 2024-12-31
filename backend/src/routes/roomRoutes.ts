import express, { Request, Response } from "express";
import { createRoom, getRoom, joinRoom } from "../controllers/roomController";

const roomRoutes = express.Router();

roomRoutes.post("/", (req: Request, res: Response) => {
  createRoom(req, res);
});

roomRoutes.get("/:roomId", (req: Request, res: Response) => {
  getRoom(req, res);
});

roomRoutes.put("/:roomId/join", (req: Request, res: Response) => {
  joinRoom(req, res);
});

export default roomRoutes;
