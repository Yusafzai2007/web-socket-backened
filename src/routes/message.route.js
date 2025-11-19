import { Router } from "express";
import { messagedata } from "../controllers/message.controller.js";
import { jwtverify } from "../middlewares/auth.middleware.js";

const route = Router();

route.post("/send-message/:id",jwtverify, messagedata);

export default route;
