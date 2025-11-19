import mongoose from "mongoose";

const messageScema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    message: {
      type: String,
      require: true,
      trim: true,
      maxlength: 1000,
      validate: [
        {
          validator: (value) => value.length > 0,
          message: "message cannot empty",
        },
      ],
    },

    createat: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const Message = mongoose.model("Message", messageScema);
