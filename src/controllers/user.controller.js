
import { asynhandler } from "../utils/asynchandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { user } from "../models/user.model.js";
import { cloudinaryimg } from "../utils/cloudinary.js";



 const registers=asynhandler(async (req,res) => {
    const {userName,email,password}=req.body
    if (!userName || !email || !password ) {
        throw new apiError(400,"all filed are required")
    }
    const checkemail=await user.findOne({email})
 
    if (checkemail) {
        throw new apiError(409,"email all ready exist")
    }

    const localimg=req.files.userImg[0].path
    const upload=await cloudinaryimg(localimg)
    if (!upload) {
        throw new apiError(500,"cloudinary img not uploades")
    }

    const create=await user.create({
        userName,
        email,
        password,
        userImg:upload.url||""
    })

    if (!create) {
        throw new apiError(500,"server error")
    }

    res.status(200).json(
        new apiResponse(200,"user add successfully",create)
    )

 })

export {registers}













































