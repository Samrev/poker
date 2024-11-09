import express from "express";
import { startGame, getGame } from "../controllers/gameController.js";

const gameRoutes = express.Router();
gameRoutes.post("/", startGame);
gameRoutes.get("/", getGame);

export default gameRoutes;
