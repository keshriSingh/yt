const User = require("../models/userModel");
const { uploadOnCloudinary } = require("../utils/cloudinary");
const jwt = require('jsonwebtoken')

const generateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken =  await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    return res.status(500).send("Something went wrong");
  }
};

const register = async (req, res) => {
  try {
    const { userName, fullName, email, password } = req.body;

    if (
      [userName, fullName, email, password].some(
        (field) => field?.trim() === ""
      )
    ) {
      throw new Error("All fields are required");
    }

    if (!email.includes("@")) {
      throw new Error("Invalid Email");
    }

    const existedUser = await User.findOne({
      $or: [{ userName }, { email }],
    });

    if (existedUser) {
      throw new Error("User allready existed");
    }

    const avatarLocalPath = req.files?.avatar?.[0].path;
    const coverImageLocalPath = req.files?.coverImage?.[0].path;

    if (!avatarLocalPath) {
      throw new Error("Avtar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
      throw new Error("avatar file is required");
    }

    const user = await User.create({
      fullName,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      userName: userName.toLowerCase(),
      password,
      email,
    });

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );
    if (!createdUser) {
      return res.status(500).json({
        message: "Failed to create user",
      });
    }

    res.status(201).json({
      data: createdUser,
    });
  } catch (error) {
    res.status(500).send("" + error);
  }
};

const login = async (req, res) => {
  try {
    const { userName, email, password } = req.body;

    if (!userName.trim() && !email.trim()) {
      throw new Error("Invalid credentials");
    }
    if (!password) {
      throw new Error("Invalid credentials");
    }

    const user = await User.findOne({
      $or: [{ userName }, { email }],
    });

    if (!user) {
      throw new Error("User dose not exist");
    }

    const isValidPassword = await user.isPasswordCorrect(password);
    if (!isValidPassword) {
      throw new Error("Invalid credentials");
    }

    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        data: loggedInUser,
      });
  } catch (error) {
    res.status(500).send("" + error);
  }
};

const logout = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id,
        {
           $set: {
             refreshToken:""
           }
        },
        {
            new:true
        }
    )

    const options = {
        httpOnly:true,
        secure:true,
    }

    return res.status(200).clearCookie('accessToken',options).clearCookie('refreshToken',options).json({data:"Logout succesfully"})

  } catch (error) {
    res.status(500).send("" + error);
  }
};

const refreshAccessToken = async (req,res)=>{
  const incomingRefreshToken = req.cookies.refreshToken
  if(!incomingRefreshToken){
    throw new Error("Invalid Token")
  }

  try {
    
    const payload = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
    if(!payload){
      throw new Error("Invalid Refresh Token")
    }

    const user = await User.findById(payload._id)
    if(!user){
      throw new Error("Invalid Refresh Token")
    }

    if(user.refreshToken.toString() !== incomingRefreshToken.toString()){
      throw new Error('Refresh token is expired or used')
    }

    const {accessToken,refreshToken} = await generateAccessTokenAndRefreshToken(user._id)

    const options = {
      httpOnly:true,
      secure:true
    }

    res.status(200).cookie('accessToken',accessToken,options).cookie('refreshToken',refreshToken,options).json({
      data:"Access Token refreshed"
    })

  } catch (error) {
    res.status(500).send("" + error);
  }
}

const changeCurrentPassword = async(req,res)=>{
  try {

    const {oldPassword,newPassword} = req.body

    if(!(oldPassword && newPassword)){
      throw new Error("Both fields are required")
    }

    const user = await User.findById(req.user._id);
    if(!user){
      throw new Error("User does not exist")
    }

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if(!isPasswordCorrect){
      throw new Error("Wrong Old Password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave:false})

    res.status(200).json({
      data:"password change successfully"
    })

  } catch (error) {
    res.status(500).send(""+error)
  }
}

const getUser = async(req,res)=>{
  try {

    const user = await User.findById(req.user._id).select('-password -refreshToken');

    res.status(200).json({
      data:user
    })
  } catch (error) {
    res.status(500).send(""+error)
  }
}

const updateAccountDetails = async(req,res)=>{
  try {

    const { fullName,email } = req.body 
    if(!(fullName && email)){
      throw new Error('Field are required')
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set:{
          fullName,
          email
        }
      },
      {new:true}
    ).select("-password -refreshToken")

    res.status(200).json({
      data:user
    })

  } catch (error) {
    res.status(200).send(''+error)
  }
}

const updateUserAvatar = async(req,res)=>{
  try {

    const avatarLocalPath = req.file?.path;
    if(!avatarLocalPath){
      throw new Error("Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if(!avatar.url){
      throw new Error('Error Occured While Uploading Avatar')
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set:{
          avatar:avatar.url
        }
      },
      {new:true}
    ).select('-password -refreshToken')

    res.status(200).json({
      data:user
    })

  } catch (error) {
    res.status(500).send(''+error)
  }
}

const updateUserCoverImage = async (req,res)=>{
  try {
    const coverImageLocalPath = req.file.path
    if(!coverImageLocalPath){
      throw new Error("CoverImage file is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if(!coverImage.url){
      throw new Error("Error Occured While Uploading Cover Image")
    }
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set:{
          coverImage:coverImage.url
        }
      },
      {new:true}
    ).select('-password -refreshToken')

    res.status(200).send({
      data:user
    })

  } catch (error) {
    res.status(500).send(""+error)
  }
}

module.exports = { register, login, logout, refreshAccessToken, changeCurrentPassword, getUser, updateAccountDetails, updateUserAvatar, updateUserAvatar, updateUserCoverImage };