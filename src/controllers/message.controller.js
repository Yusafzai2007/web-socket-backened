// controllers/messageController.js
import { asynhandler } from "../utils/asynchandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";
import { cloudinaryimg } from "../utils/cloudinary.js";
import { getMessageId, io } from "../socket/server.js";
import { user } from "../models/user.model.js";

// SEND MESSAGE FUNCTION
const messagedata = asynhandler(async (req, res) => {
  try {
    const senderId = req.user?._id;

    if (!senderId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const receiverId = req.params.id;
    const { message } = req.body;

    let convo = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!convo) {
      convo = await Conversation.create({
        participants: [senderId, receiverId],
        messages: [],
      });
    }

    let imgUrl = "";
    if (req.files?.userImg?.[0]) {
      try {
        const localImg = req.files.userImg[0].path;
        const upload = await cloudinaryimg(localImg);
        imgUrl = upload?.url || "";
      } catch (err) {
        console.error("Cloudinary upload failed:", err);
        imgUrl = "";
      }
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      message,
      userImg: imgUrl,
    });

    convo.messages.push(newMessage._id);
    await convo.save();

    // 🔥 SOCKET.IO: send to receiver
    const receiverSocketId = getMessageId(receiverId);
    if (receiverSocketId && io) {
      io.to(receiverSocketId).emit("message", newMessage);
    }

    // 🔥🔥🔥 SUPER IMPORTANT
    // SEND TO SENDER ALSO
    const senderSocketId = getMessageId(senderId);
    if (senderSocketId && io) {
      io.to(senderSocketId).emit("message", newMessage);
    }

    return res
      .status(200)
      .json(new apiResponse(200, "Message created successfully", newMessage));

  } catch (error) {
    console.error("Send Message Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});



const getmessges = asynhandler(async (req, res) => {
  try {
    const { id } = req.params;
    const senderId = req.user._id;

    let convo = await Conversation.findOne({
      participants: { $all: [senderId, id] },
    }).populate("messages");

    if (!convo) {
      res.status(201).json([]);
    }

    const message = convo.messages;
    res
      .status(200)
      .json(new apiResponse(200, "message fetch successfully", message));
  } catch (error) {
    console.log(error);
  }
});

const navbardata = asynhandler(async (req, res) => {
  const { id } = req.params;

  // Correct query format
  const userdata = await user.findOne({ _id: id }).select("-password");

  if (!userdata) {
    throw new apiError(404, "User not found");
  }

  res
    .status(200)
    .json(new apiResponse(200, "User data fetched successfully", userdata));
});

export { messagedata, getmessges, navbardata };
