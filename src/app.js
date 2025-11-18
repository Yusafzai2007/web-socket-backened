import express from "express";
import cookieParser from "cookie-parser";

const app = express();
import cors from "cors";
app.use(
  cors({
    origin: process.env.Cors_ORIGN,
    credential: true,
  })
);

app.use(express.json({ limit: "16kbs" }));
app.use(express.urlencoded({ extended: true, limit: "16kbs" }));
app.use(express.static("public"));
app.use(cookieParser());

///   users routes js
import userRoutes from "./routes/user.route.js";
app.use("/api/v1/socket", userRoutes);

export default app;
