import { Router } from "express";
import { getsignup, login, logout, registers, singleuser, updatprofile, verifyotp } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { jwtverify } from "../middlewares/auth.middleware.js";

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
route.get("/single-user",jwtverify,singleuser)
route.get("/users",jwtverify,getsignup)
route.put("/update-profile/:id",upload.fields([{
   name: "userImg",
      maxCount: 1,
}]),updatprofile)



route.post("/logout",jwtverify,logout)



export default route;
