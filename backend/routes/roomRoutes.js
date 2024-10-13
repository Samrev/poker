import express from "express";
import {createRoom, getRoom, joinRoom} from "../controllers/roomController.js";
const roomRoutes = express.Router();

roomRoutes.post('/', createRoom);
roomRoutes.get('/:roomId', getRoom);
roomRoutes.put('/:roomId/join', joinRoom);

export default roomRoutes;
