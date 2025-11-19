import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    userImg: {
      type: String,
    },
     role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    emailotp: {
      type: String,
    },
    expireotp: {
      type: Date,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  return (this.password = await bcrypt.hash(this.password, 10));
});

userSchema.methods.ispasswordcorrect = async function (password) {
  return (password = await bcrypt.compare(password, this.password));
};

userSchema.methods.isaccesstoken = async function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.isrefrehtoken = async function () {
 return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const user = mongoose.model("user", userSchema);
