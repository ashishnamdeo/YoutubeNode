// Auth middle ware Verfiy karega ye user hai ya nahi

import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {User} from '../models/user.model.js'

// why we are validation tokens
// Authorization : Bearer <accesToken>
export const  verifyJWT = asyncHandler(async(req, _, next)=>{
   try {
     const token = await req.cookies?.accessToken || 
    req.header("Authorization")?.replace("Bearer ", "")

    if(!token){
        throw new ApiError(401, "Unauthorized request")
    }

    //info ko decode karna padega

   const decodeToken = await jwt.verifyJWT(token, process.env.ACCESS_TOKEN_SECRET)

   const user = await User.findById(decodeToken?._id).select("-password -refreshToken")
if(!user){
    // ToDo: discuss about frontend
    throw new ApiError(401, 'Invalid Access Token');
}

req.user = user;
next()
   } catch (error) {
    throw new ApiError(401, 'Invalid access token')
   }

})