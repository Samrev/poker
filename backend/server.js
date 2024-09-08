import express from "express";
import guestRoutes from "./routes/guestRoutes.js";
import cors from "cors";
import roomRoutes from "./routes/roomRoutes.js";
import connectDB from "./connect.js";
import dotenv from 'dotenv';

dotenv.config();
const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({extended:false}));
app.use('/api/guests', guestRoutes);
app.use('/api/rooms', roomRoutes);
connectDB()
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});