const User = require("../models/userModel");
const { uploadOnCloudinary } = require("../utils/cloudinary");

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

module.exports = { register, login, logout };