import express from "express";
import cookieParser from "cookie-parser";
import { apiError } from "./utils/apiError.js";
const app = express();
import cors from "cors";
app.use(
  cors({
    origin: process.env.Cors_ORIGN,
    credential: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.static("public"));
app.use(cookieParser());

///   users routes js
import userRoutes from "./routes/user.route.js";
app.use("/api/v1/socket", userRoutes);

///   message routes js
import messageRoutes from "./routes/message.route.js";
app.use("/api/v1/socket", messageRoutes);

// ✅ Custom Error Handling Middleware (must be at the END)
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

export default app;
