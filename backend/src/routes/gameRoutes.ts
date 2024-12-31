import express, { Request, Response } from "express";
import {
  startGame,
  getGame,
  checkGame,
  raiseGame,
  foldGame,
  allInGame,
  resetGame,
  resetRound,
  getWinners,
} from "../controllers/gameController";

const gameRoutes = express.Router();

gameRoutes.post("/", (req: Request, res: Response) => {
  startGame(req, res);
});

gameRoutes.get("/", (req: Request, res: Response) => {
  getGame(req, res);
});

gameRoutes.put("/check", (req: Request, res: Response) => {
  checkGame(req, res);
});

gameRoutes.put("/raise", (req: Request, res: Response) => {
  raiseGame(req, res);
});

gameRoutes.put("/fold", (req: Request, res: Response) => {
  foldGame(req, res);
});

gameRoutes.put("/allIn", (req: Request, res: Response) => {
  allInGame(req, res);
});

gameRoutes.put("/resetRound", (req: Request, res: Response) => {
  resetRound(req, res);
});

gameRoutes.put("/resetGame", (req: Request, res: Response) => {
  resetGame(req, res);
});

gameRoutes.put("/winners", (req: Request, res: Response) => {
  getWinners(req, res);
});

export default gameRoutes;
