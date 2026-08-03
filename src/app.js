import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        credentials: true,
    })
);

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Browear Backend Running..."
    });
});

app.use("/api/auth", authRoutes);

export default app;