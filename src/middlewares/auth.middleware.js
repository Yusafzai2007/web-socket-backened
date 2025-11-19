import { user } from "../models/user.model.js";
import { apiError } from "../utils/apiError.js";
import { asynhandler } from "../utils/asynchandler.js";
import jwt from "jsonwebtoken";

const jwtverify = asynhandler(async (req, res, next) => {
  try {
    // Get token from cookies or Authorization header
    const token =
      req.cookies?.accesstoken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new apiError(401, "Unauthorized request: token missing");
    }

    // Verify token
    const decode = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Find user
    const existingUser = await user.findById(decode._id).select("-password");
    if (!existingUser) {
      throw new apiError(401, "Unauthorized: user not found");
    }

    // Attach user to request
    req.user = existingUser;
    next();
  } catch (error) {
    throw new apiError(401, error?.message || "Invalid token");
  }
});

export { jwtverify };
