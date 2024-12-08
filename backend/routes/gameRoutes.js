import express from "express";
import {
  startGame,
  getGame,
  checkGame,
  raiseGame,
  foldGame,
  allInGame,
  resetGame,
  resetRound,
} from "../controllers/gameController.js";

const gameRoutes = express.Router();
gameRoutes.post("/", startGame);
gameRoutes.get("/", getGame);
gameRoutes.put("/check", checkGame);
gameRoutes.put("/raise", raiseGame);
gameRoutes.put("/fold", foldGame);
gameRoutes.put("/allIn", allInGame);
gameRoutes.put("/resetRound", resetRound);
gameRoutes.put("/resetGame", resetGame);

export default gameRoutes;
