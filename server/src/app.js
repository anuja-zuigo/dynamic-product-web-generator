import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";

import authRouter from "./routes/auth.router.js";
import productRoutes from "./routes/product.router.js";
import uploadRoutes from "./routes/upload.router.js";
import excelImportRouter from "./routes/excelImport.router.js";
import webpageRouter from "./routes/webpage.router.js";
import productsPageRouter from "./routes/productsPage.router.js";
import dashboardRouter from "./routes/dashboard.router.js";
import importLogRouter from "./routes/importLog.router.js";
import copilotRouter from "./routes/copilot.router.js";

const app = express();

// Serve static files from the "uploads" directory
app.use("/uploads", express.static(path.resolve("uploads")));

/* Middlewares FIRST */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Configure Helmet to allow inline scripts/styles and base64/local image sources for the generated frontend pages
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        scriptSrcAttr: ["'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https:"],
        imgSrc: ["'self'", "data:", "https:"],
        fontSrc: ["'self'", "https:", "data:"],
      },
    },
  })
);

app.use(morgan("dev"));

/* Routes AFTER middleware */
app.use("/", dashboardRouter);
app.use("/product", webpageRouter);
app.use("/products", productsPageRouter);
app.use("/api/v1/excel", excelImportRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/uploads", uploadRoutes);
app.use("/api/v1/import", importLogRouter);
app.use("/api/v1/copilot", copilotRouter);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Dynamic Product Management API is running 🚀",
  });
});

export default app;