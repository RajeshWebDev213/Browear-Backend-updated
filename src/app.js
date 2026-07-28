import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors"
import connectDB from "./config/db.js"

const app = express();
connectDB();
app.use(cors());
app.use(express.json());


export default app;