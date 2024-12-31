"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const gameController_1 = require("../controllers/gameController");
const gameRoutes = express_1.default.Router();
gameRoutes.post("/", (req, res) => {
    (0, gameController_1.startGame)(req, res);
});
gameRoutes.get("/", (req, res) => {
    (0, gameController_1.getGame)(req, res);
});
gameRoutes.put("/check", (req, res) => {
    (0, gameController_1.checkGame)(req, res);
});
gameRoutes.put("/raise", (req, res) => {
    (0, gameController_1.raiseGame)(req, res);
});
gameRoutes.put("/fold", (req, res) => {
    (0, gameController_1.foldGame)(req, res);
});
gameRoutes.put("/allIn", (req, res) => {
    (0, gameController_1.allInGame)(req, res);
});
gameRoutes.put("/resetRound", (req, res) => {
    (0, gameController_1.resetRound)(req, res);
});
gameRoutes.put("/resetGame", (req, res) => {
    (0, gameController_1.resetGame)(req, res);
});
gameRoutes.put("/winners", (req, res) => {
    (0, gameController_1.getWinners)(req, res);
});
exports.default = gameRoutes;
//# sourceMappingURL=gameRoutes.js.map