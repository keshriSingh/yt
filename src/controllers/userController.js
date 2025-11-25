const { default: mongoose } = require("mongoose");
const User = require("../models/userModel");
const {
  uploadOnCloudinary,
  deleteFromCloudinary,
} = require("../utils/cloudinary");
const jwt = require("jsonwebtoken");

const generateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new Error("Token generation failed: " + error.message);
  }
};

const register = async (req, res) => {
  try {
    const { userName, fullName, email, password } = req.body;

    if ([userName, fullName, email, password].some(field => field?.trim() === "")) {
      throw new Error("All fields are required");
    }

    if (!email.includes("@")) {
      throw new Error("Invalid Email");
    }

    const existedUser = await User.findOne({
      $or: [{ userName }, { email }],
    });

    if (existedUser) {
      throw new Error("User already exists");
    }

    const avatarLocalPath = req.files?.avatar?.[0].path;
    const coverImageLocalPath = req.files?.coverImage?.[0].path;

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    const user = await User.create({
      fullName,
      avatar: avatar?.url,
      coverImage: coverImage?.url || "",
      userName: userName?.toLowerCase(),
      password,
      email,
    });

    // Generate tokens
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    // Cookie options (HTTP deployment)
    const cookieOptions = {
      httpOnly: true,
      secure: false,   // because you're running without HTTPS
      sameSite: "lax",
    };

    res
      .status(201)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json({
        message: "User registered successfully",
        data: createdUser,
      });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { userName, email, password } = req.body;

    if (!userName?.trim() && !email?.trim()) {
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

    const { accessToken, refreshToken } =
      await generateAccessTokenAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    const options = {
      httpOnly: true,
      secure: false, // because you are not using HTTPS yet
      sameSite: "lax",
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
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $unset: {
          refreshToken: 1,
        },
      },
      {
        new: true,
      }
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json({ data: "Logout succesfully" });
  } catch (error) {
    res.status(500).send("" + error);
  }
};

const refreshAccessToken = async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken;
  if (!incomingRefreshToken) {
    throw new Error("Invalid Token");
  }

  try {
    const payload = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    if (!payload) {
      throw new Error("Invalid Refresh Token");
    }

    const user = await User.findById(payload._id);
    if (!user) {
      throw new Error("Invalid Refresh Token");
    }

    if (user.refreshToken.toString() !== incomingRefreshToken.toString()) {
      throw new Error("Refresh token is expired or used");
    }

    const { accessToken, refreshToken } =
      await generateAccessTokenAndRefreshToken(user._id);

    const options = {
      httpOnly: true,
      secure: true,
    };

    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        data: "Access Token refreshed",
      });
  } catch (error) {
    res.status(500).send("" + error);
  }
};

const changeCurrentPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!(oldPassword && newPassword)) {
      throw new Error("Both fields are required");
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      throw new Error("User does not exist");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect) {
      throw new Error("Wrong Old Password");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      data: "password change successfully",
    });
  } catch (error) {
    res.status(500).send("" + error);
  }
};

const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "-password -refreshToken"
    );

    res.status(200).json({
      data: user,
    });
  } catch (error) {
    res.status(500).send("" + error);
  }
};

const updateAccountDetails = async (req, res) => {
  try {
    const { fullName, userName } = req.body;
    if (!(fullName && userName)) {
      throw new Error("Field are required");
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          fullName,
          userName,
        },
      },
      { new: true }
    ).select("-password -refreshToken");

    res.status(200).json({
      data: user,
    });
  } catch (error) {
    res.status(200).send("" + error);
  }
};

const updateUserAvatar = async (req, res) => {
  try {
    const avatarLocalPath = req.file?.path;
    if (!avatarLocalPath) {
      throw new Error("Avatar file is missing");
    }

    const deletedImageFormCloudinary = req.user?.avatar;

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar.url) {
      throw new Error("Error Occured While Uploading Avatar");
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          avatar: avatar.url,
        },
      },
      { new: true }
    ).select("-password -refreshToken");

    await deleteFromCloudinary(deletedImageFormCloudinary);

    res.status(200).json({
      data: user,
    });
  } catch (error) {
    res.status(500).send("" + error);
  }
};

const updateUserCoverImage = async (req, res) => {
  try {
    const coverImageLocalPath = req.file.path;
    if (!coverImageLocalPath) {
      throw new Error("CoverImage file is missing");
    }

    const deletedImageFormCloudinary = req.user?.coverImage;

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!coverImage.url) {
      throw new Error("Error Occured While Uploading Cover Image");
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          coverImage: coverImage.url,
        },
      },
      { new: true }
    ).select("-password -refreshToken");

    await deleteFromCloudinary(deletedImageFormCloudinary);
    res.status(200).send({
      data: user,
    });
  } catch (error) {
    res.status(500).send("" + error);
  }
};

const userChannelProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      throw new Error("userId is missing");
    }

    const isOwner = req.user?._id.toString() === userId;

    const channel = await User.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "channel",
          as: "subscribers",
        },
      },
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "subscriber",
          as: "subscribedTo",
        },
      },
      {
        $lookup: {
          from: "videos",
          localField: "_id",
          foreignField: "owner",
          as: "videos",
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: [isOwner, true] }, // If owner, match all videos
                    { $eq: ["$isPublished", true] }, // If not owner, only published
                  ],
                },
              },
            },
            {
              $sort: {
                createdAt: -1,
              },
            },
            {
              $project: {
                videoFile: 1,
                thumbnail: 1,
                title: 1,
                description: 1,
                duration: 1,
                views: 1,
                isPublished: 1,
                createdAt: 1,
                updatedAt: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          subscribersCount: {
            $size: "$subscribers",
          },
          channelsSubscribedToCount: {
            $size: "$subscribedTo",
          },
          isSubscribed: {
            $cond: {
              if: {
                $in: [
                  new mongoose.Types.ObjectId(req.user?._id),
                  "$subscribers.subscriber",
                ],
              },
              then: true,
              else: false,
            },
          },
          videosCount: {
            $size: "$videos",
          },
          totalViews: {
            $sum: "$videos.views",
          },
        },
      },
      {
        $project: {
          userName: 1,
          fullName: 1,
          email: 1,
          avatar: 1,
          coverImage: 1,
          subscribersCount: 1,
          channelsSubscribedToCount: 1,
          isSubscribed: 1,
          videos: 1,
          videosCount: 1,
          totalViews: 1,
          createdAt: 1,
        },
      },
    ]);

    if (!channel.length) {
      throw new Error("channel does not exists");
    }

    res.status(200).json({
      data: channel[0],
    });
  } catch (error) {
    res.status(500).send("" + error);
  }
};

const getWatchHistory = async (req, res) => {
  try {
    const user = await User.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.user._id),
        },
      },
      {
        $lookup: {
          from: "videos",
          localField: "watchHistory",
          foreignField: "_id",
          as: "watchHistory",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                  {
                    $project: {
                      fullName: 1,
                      userName: 1,
                      avatar: 1,
                    },
                  },
                ],
              },
            },
            {
              $addFields: {
                owner: {
                  $first: "$owner",
                },
              },
            },
          ],
        },
      },
    ]);

    res.status(200).json({
      data: user[0].watchHistory,
    });
  } catch (error) {
    res.status(500).send("" + error);
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshAccessToken,
  changeCurrentPassword,
  getUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  userChannelProfile,
  getWatchHistory,
};
