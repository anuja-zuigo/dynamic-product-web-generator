import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRouter from "./routes/auth.router.js";

const app = express();

/* Middlewares FIRST */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

/* Routes AFTER middleware */
app.use("/api/v1/auth", authRouter);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Dynamic Product Management API is running 🚀",
  });
});

export default app;