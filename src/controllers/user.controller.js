import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import {User} from '../models/user.model.js'
import { uploadOnCloudnary } from '../utils/cloundnary.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';

const generateAccessAndRefreshTokens = async(userId)=>{
    try {
        
       const user = await User.findById(userId);
       const accessToken = await user.generateAccessToken();
       const refreshToken = await user.generateRefreshToken();

       user.refreshToken = refreshToken;

       await user.save({validationBeforeSave: false})

        return { refreshToken, accessToken };


    } catch (error) {
        throw new ApiError(500, 'Something   went wrong when upating the tokens');
    }
}

// Register

const registerUser = asyncHandler( async(req,res)=>{

        // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

        const { fullname, email, username,password} = req.body;
        console.log('email', email);
        // if(fullname === ""){
        //     throw new ApiError(400, 'fullname is required')
        // }

        if ([username, fullname, email, password].some((field)=> field?.trim() === "" )) {
            throw new ApiError(400, 'All fields are required')
        }
 
        // check if user already exists: username, email

        const existedUser = await User.findOne({
            $or: [{username}, {email}]
        })
        console.log(req.files)
        if(existedUser){
            throw new ApiError(409, 'User with username or email already exists')
        }

        // check for images, check for avatar

        // check with req.files on console.log
        const avatarLocalPath = req.files?.avatar[0]?.path;
        //const coverImageLocalPath = req.files?.coverImage[0]?.path;

        let coverImageLocalPath;
        if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
            coverImageLocalPath = req.files?.coverImage[0]?.path;
        }

        if( !avatarLocalPath){
            throw new ApiError(400, 'Avatar file is required')
        }



        // upload them to cloudinary, avatar

        const avatar = await uploadOnCloudnary(avatarLocalPath);
        const coverImage = await uploadOnCloudnary(coverImageLocalPath)

        if(!avatar){
            throw new ApiError(400, "Avatar file is required")
        }

        // create user object - create entry in db

      const user = await  User.create({
            fullname, 
            avatar:avatar.url,
            coverImage: coverImage?.url || "",
            email,
            username: username.toLowerCase(),
            password

        })

      // checking user created or not
      const createdUser =  await User.findById(user._id).select(
        "-password -refreshToken"
      )

      if(!createdUser){
        throw new ApiError(500, 'Something wrong when createing the user')
      }

    // Return res
      return res.status(201).json(
        new ApiResponse(200, createdUser, 'User Registered Successfully !!!')
      )

})

// LOGIN USER

const loginUser = asyncHandler(async(req,res)=>{
/* todos */

// req body se data le aayo :req.body -> data
// username or email
// find the user
//password check
// is correct access & refresh token
// send with sequre cookies

const {username,email,password} = req.body;

if(!username && !email){
    throw new ApiError(400, "Username & password is required")
}

const user = await User.findOne({
    // MongoDB operator
    $or: [{username}, {email}]
})

if(!user){
    throw new ApiError(404, 'User doesnot exist');
}

const isPasswordValid =  await user.isPasswordCorrect(password);

if(!isPasswordValid){
    throw new ApiError(404, 'Invalid user credentials');
}

const{accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);

const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

// send cookies
const options = {
    httpOnly: true, // bydefault anyone can modified from the FE but this option true only server se modified hoti hai 
    secure: true
}

return res
.status(200)
.cookie('accessToken', accessToken, options)
.cookie('refreshToken',refreshToken, options)
.json(
    new ApiResponse(200, 
        {
            user: loggedInUser,accessToken, refreshToken

        },
        "User loggedin Successfully"
    )
)

})

// Logout USER

const logoutUser = asyncHandler(async(req,res)=>{

    // Remove the token from the cookies
    // Remove the token from the user

   await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            },
        },
            {
                new: true
            },
   )
    
    const options = {
    httpOnly: true, // bydefault anyone can modified from the FE but this option true only server se modified hoti hai 
    secure: true
}
 
return res
.status(200)
.clearCookie("accessToken")
.clearCookie("refreshToken")
.json(new ApiResponse(200, {}, "User logged out"))

})

const refreshAccessToken = asyncHandler(async(req, res)=>{

   const incomingRefreshToken =  req.cookies.refreshToken || req.body.refreshToken

   if(!incomingRefreshToken){
        throw new ApiError('401', 'Unauthorized Request' )
   }

 try {
     const decodedToken = await jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

   const user = await User.findById(decodedToken._id)
if (!user) {
    throw new ApiError(401, 'Invalid Refresh Token')   
}
if(incomingRefreshToken !== user?.refreshToken){
    throw new ApiError(401, "Refresh token is expired or used")
}
const options = {
    httpOnly: true,
    secure: true
}
const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id);

return res
.status(200)
.cookie("accessToken", accessToken, options )
.cookie("refreshToken", newRefreshToken, options)
.json(
    new ApiResponse(
        200,
        accessToken,
        newRefreshToken,
        "Access Token successfully refreshed"

    )
)
 } catch (error) {
    throw new ApiError(401, error?.message)
 || 'Invalid refresh token' }
})

// Change Password

const changePassword = asyncHandler(async(req,res)=>{
    const {oldPasswrord, newPassword, confirmPasword} = req.body;

    if(!(newPassword === confirmPasword)){
        throw new ApiError(400, "Both password not matching")
    }

    const user = User.findById(req.body._id)
    const isPasswordCorrect = isPasswordCorrect(oldPasswrord);

    if(!isPasswordCorrect){
        throw new ApiError(400, "Invalid Old Password")
    }

    user.password = newPassword;

    await user.save({validationBeforeSave: false})
    return res 
    .status(200)
    .json(
        new ApiResponse(200, {}, "Password Changed Successfully")
    )
})

// Get current user

const getCurrentUser = asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(
        new ApiResponse(200, req.user, "current user fetched successfully" )
    )
})

// Update account details

const  updateAccountDetails = asyncHandler((req, res)=>{
    const {fullname, email, } = req.body;
    if(!fullname || !email){
        new ApiError(400, 'All Fields Required')
    }

    User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                //Or fullname: fullname,
               // email: email
                fullname,
                email
            }
        },
        {new: true}// will return the update hone ke baad information means update info
    ).select("-password")
    return res
    .status(200,)
    .json(new ApiResponse(200, "Account details successfully updated"))
})

//  update Avatar

const updateAvatar = asyncHandler(async(req, res)=>{

    // req.files will get from the multer middleware

    const avatarLocalPath = req.file?.path;

    if(!avatarLocalPath){
        throw ApiError('400', "Avatar file is missing")
    }
// TODO:: delete old image - assignment[create the small utility function after uploading will remove the old images ]
    const avatar = await uploadOnCloudnary(avatarLocalPath)

    if(!avatar.url){
        throw ApiError('400', "Errow while uploading on Avatar");
    }

  const user =  await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {
            new: true
        }
    )

    return res
    .status(200)
    .json(
        new ApiResponse(200, "Avatar image successfully updated")
    )

})

const updateUserCoverImage = asyncHandler(async(req, res)=>{
    const converImageLocalPath = req.file?.path;

    if(!converImageLocalPath){
        throw ApiError(400, "Cover Image is missing")
    }

    const coverImage = await uploadOnCloudnary(converImageLocalPath)
    if(!coverImageLocalPath.url){
        throw ApiError('400', "Errow while uploading on Avatar");
    }

   const user = await User.findByIdAndUpdate(
        req.user?._id,
        {

        },
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {
            new: true
        }
    ).select("-isPasswordCorrect")

    return res
    .status(200)
    .json(
        new ApiResponse(200, "Conver image updated successfully")
    )
})

export {registerUser, loginUser, logoutUser, refreshAccessToken, changePassword, getCurrentUser,updateAvatar, updateUserCoverImage}