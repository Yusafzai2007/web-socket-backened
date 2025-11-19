import { asynhandler } from "../utils/asynchandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { user } from "../models/user.model.js";
import { cloudinaryimg } from "../utils/cloudinary.js";
import { otpgenerator } from "../utils/otp-generator.js";
import { sendemail } from "../service/email.service.js";

const generateaccesstoken = async (userId) => {
  try {
    const userdata = await user.findById(userId);
    const isaccesstoken = await userdata.isaccesstoken();
    const isrefrehtoken = await userdata.isrefrehtoken();
    return { isaccesstoken, isrefrehtoken };
  } catch (error) {
    throw new apiError(500, "server error genenrating token");
  }
};

const registers = asynhandler(async (req, res) => {
  const { userName, email, password } = req.body;

  if (!userName || !email || !password) {
    throw new apiError(400, "All fields are required");
  }

  // Generate OTP
  const otp = await otpgenerator();
  const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  // Check email already exists
  const checkemail = await user.findOne({ email });
  if (checkemail) {
    throw new apiError(409, "Email already exists");
  }

  // Upload image
  const localimg = req.files?.userImg?.[0]?.path;
  if (!localimg) {
    throw new apiError(400, "User image is required");
  }

  const upload = await cloudinaryimg(localimg);
  if (!upload) {
    throw new apiError(500, "Cloudinary image upload failed");
  }

  // Create user
  const newUser = await user.create({
    userName,
    email,
    password,
    userImg: upload.url || "",
    emailotp: otp,
    expireotp: expiry,
  });

  if (!newUser) {
    throw new apiError(500, "Server error");
  }

  // Send OTP email
  await sendemail(email, otp);

  // Send response
  return res
    .status(201)
    .json(new apiResponse(201, newUser, "User registered successfully"));
});

const verifyotp = asynhandler(async (req, res) => {
  const { email, otp } = req.body;

  try {
    const users = await user.findOne({ email });
    if (!users) {
      throw new apiError(404, "user not fouhnd");
    }
    const now = new Date();
    if (
      !users.emailotp ||
      String(users.emailotp) !== String(otp) ||
      now > new Date(users.expireotp)
    ) {
      throw new apiError(400, "Invalid or expired OTP");
    }
    (users.emailotp = null), (users.expireotp = null);
    await users.save();
    res.status(200).json(new apiResponse(200, "otp verify successfully"));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new apiResponse(500, null, "OTP verification failed"));
  }
});

const login = asynhandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    throw new apiError(404, "all field are required");
  }

  const checkemail = await user.findOne({ email });
  if (!checkemail) {
    throw new apiError(404, "user not found");
  }

  const checkpassword = await checkemail.ispasswordcorrect(password);
  if (!checkpassword) {
    throw new apiError(404, "password wrong");
  }

  const { isaccesstoken, isrefrehtoken } = await generateaccesstoken(
    checkemail._id
  );

  console.log("isaccesstoken", isaccesstoken);
  console.log("isrefrehtoken", isrefrehtoken);

  const option = {
    httpOnly: true,
    secure: false,
  };

  res
    .status(200)
    .cookie("isaccesstoken", isaccesstoken, option)
    .cookie("isrefrehtoken", isrefrehtoken, option)
    .json(new apiResponse(200, "logged in successfully"));
});

export { registers, login, verifyotp };
