import { Router } from "express";
import { registers } from "../controllers/user.controller.js";
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

export default route;
