import express from "express";
import { startGame } from "../controllers/gameController.js";

const gameRoutes = express.Router();
gameRoutes.post("/:roomId", startGame);

export default gameRoutes;
