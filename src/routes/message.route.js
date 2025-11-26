import { Router } from "express";
import { getmessges, messagedata, navbardata } from "../controllers/message.controller.js";
import { jwtverify } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
const route = Router();

route.post(
  "/send-message/:id",
  jwtverify,
  upload.fields([
    {
      name: "userImg",
      maxCount: 1,
    },
  ]),
  messagedata
);

route.get("/get-messges/:id", jwtverify, getmessges);
route.get("/navbar-messges/:id", jwtverify, navbardata);

export default route;
