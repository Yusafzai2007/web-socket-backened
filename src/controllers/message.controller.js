import { asynhandler } from "../utils/asynchandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";

const messagedata = asynhandler(async (req, res) => {
  try {
    const { message } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;

    let convo = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!convo) {
      convo = await Conversation.create({
        participants: [senderId, receiverId],
        messages: [],
      });
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      message,
    });

    convo.messages.push(newMessage._id);
    await convo.save();
    res.status(200).json(new apiResponse(200, "message create successfully"));
  } catch (error) {
    console.error(error);

    res
      .status(500)
      .json({ success: false, message: "Internal Server Error", error });
  }
});

export { messagedata };
