import { Router } from "express";
import { login, registers, verifyotp } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const route = Router();

route.post(
  "/signup",
  upload.fields([
    {
      name: "userImg",
      maxCount: 1,
    },
  ]),
  registers
);

route.post("/login",login)
route.post("/verify-otp",verifyotp)

export default route;
