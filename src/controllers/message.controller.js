import { asynhandler } from "../utils/asynchandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";
import { cloudinaryimg } from "../utils/cloudinary.js";
import { user } from "../models/user.model.js";

const messagedata = asynhandler(async (req, res) => {``
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
    
      let imgUrl = "";
    
      if (req.files && req.files.userImg && req.files.userImg[0]) {
        const localimg = req.files.userImg[0].path;
    
        const upload = await cloudinaryimg(localimg);
        if (!upload) throw new apiError(500, "Cloudinary upload failed");
    
        imgUrl = upload.url;
      }
    

    const newMessage = await Message.create({
      senderId,
      receiverId,
      message,
      userImg: imgUrl,
    });

    convo.messages.push(newMessage._id);
    await convo.save();
    res.status(200).json(new apiResponse(200, "message create successfully",newMessage));
  } catch (error) {
    console.error(error);

    res
      .status(500)
      .json({ success: false, message: "Internal Server Error", error });
  }
});



const getmessges=asynhandler(async (req,res) => {
try {
    const {id}=req.params
    const senderId=req.user._id
  
     let convo=await Conversation.findOne({
      participants:{$all:[senderId,id]}
     }).populate("messages")
      
     if (!convo) {
      res.status(201).json([])
     }
  
      const message = convo.messages;
      res
        .status(200)
        .json(new apiResponse(200, "message fetch successfully", message));
} catch (error) {
    console.log(error);
  }
})

const navbardata = asynhandler(async (req, res) => {
  const { id } = req.params;

  // Correct query format
  const userdata = await user.findOne({ _id: id }).select("-password");

  if (!userdata) {
    throw new apiError(404, "User not found");
  }

  res.status(200).json(
    new apiResponse(200, "User data fetched successfully", userdata)
  );
});



export { messagedata,getmessges,navbardata };
