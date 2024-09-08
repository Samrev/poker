import express from "express";
import {createGuest} from "../controllers/guestController.js";
const guestRoutes = express.Router();

guestRoutes.post('/', createGuest);

export default guestRoutes;
