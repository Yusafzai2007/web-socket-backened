import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectdb } from "./db/index.js";
import userRoutes from "./routes/user.route.js";
import messageRoutes from "./routes/message.route.js";
import { apiError } from "./utils/apiError.js";
import { initsocket } from "./socket/server.js";

dotenv.config({ path: "./.env" });

const app = express();

// Middlewares
app.use(
  cors({
    origin: "http://localhost:4200",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/v1/socket", userRoutes);
app.use("/api/v1/socket", messageRoutes);

// Custom error handler
app.use((err, req, res, next) => {
  if (err instanceof apiError) {
    return res.status(err.statuscode).json({
      success: false,
      message: err.message,
      error: err.error || [],
    });
  }
  return res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// Start server
const server = initsocket(app);

connectdb().then(() => {
  server.listen(process.env.PORT || 8000, () => {
    console.log(`Server running on port ${process.env.PORT}`);
  });
});
