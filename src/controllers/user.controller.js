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
  const { userName, email, password, bio } = req.body;

  if (!userName || !email || !password) {
    throw new apiError(400, "All fields are required");
  }

  const otp = await otpgenerator();
  const expiry = new Date(Date.now() + 5 * 60 * 1000);

  const checkemail = await user.findOne({ email });
  if (checkemail) {
    throw new apiError(409, "Email already exists");
  }

  let imgUrl = "";

  if (req.files && req.files.userImg && req.files.userImg[0]) {
    const localimg = req.files.userImg[0].path;

    const upload = await cloudinaryimg(localimg);
    if (!upload) throw new apiError(500, "Cloudinary upload failed");

    imgUrl = upload.url;
  }

  const newUser = await user.create({
    userName,
    email,
    password,
    userImg: imgUrl,
    emailotp: otp,
    expireotp: expiry,
    bio,
  });

  if (!newUser) {
    throw new apiError(500, "Server error");
  }

  // Send OTP email
  await sendemail(email, otp);

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

  console.log("accesstoken", isaccesstoken);
  console.log("refrehtoken", isrefrehtoken);

  const option = {
    httpOnly: true,
    secure: false,
  };

  // LOGIN
  res
    .status(200)
    .cookie("accesstoken", isaccesstoken, option)
    .cookie("refrehtoken", isrefrehtoken, option)
    .json(new apiResponse(200, "logged in successfully"));
});

const getsignup = asynhandler(async (req, res) => {
  const loggedinuser=req.user._id
  const users = await user.find({_id:{$ne:loggedinuser}}).select("-password");
  if (!users || users.length === 0) {
    throw new apiError(400, "user data is empty");
  }

  res.status(200).json(new apiResponse(200, "users fetch successfully", users));
});

const singleuser = asynhandler(async (req, res) => {
  const id = req.user;
  if (!id) {
    throw new apiError(400, "User ID is required");
  }

  const userdata = await user.findById(id);

  if (!userdata) {
    throw new apiError(404, "User not found");
  }

  res
    .status(200)
    .json(new apiResponse(200, userdata, "User fetched successfully"));
});

const updatprofile = asynhandler(async (req, res) => {
  const { id } = req.params;
  const { userName, email, bio } = req.body;

  if (!userName || !email || !bio) {
    throw new apiError(400, "All update fields are required");
  }

  // Prepare update object
  const updatefield = { userName, email, bio };

  // Check if image uploaded
  if (req.files?.userImg?.[0]?.path) {
    const localimg = req.files.userImg[0].path;
    const uploadimg = await cloudinaryimg(localimg);

    if (!uploadimg) {
      throw new apiError(500, "Cloudinary image upload failed");
    }

    updatefield.userImg = uploadimg.url;
  }

  // Update user
  const updatedata = await user.findByIdAndUpdate(id, updatefield, {
    new: true,
  });

  if (!updatedata) {
    throw new apiError(404, "User not found");
  }

  res
    .status(200)
    .json(new apiResponse(200, updatedata, "User updated successfully"));
});

const logout = asynhandler(async (req, res) => {
  await user.findByIdAndUpdate(req.user._id);
  const option = {
    httpOnly: true,
    secure: false,
  };

  // LOGOUT
  res
    .status(200)
    .clearCookie("accesstoken", option)
    .clearCookie("refrehtoken", option)
    .json(new apiResponse(200, "User logged out successfully"));
});

export {
  registers,
  login,
  verifyotp,
  getsignup,
  singleuser,
  updatprofile,
  logout,
};
