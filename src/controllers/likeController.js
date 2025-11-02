const { default: mongoose } = require("mongoose");
const Comment = require("../models/commentModel");
const Like = require("../models/likeModel");
const Tweet = require("../models/tweetModel");
const Video = require("../models/videoModel");

const toggleVideoLike = async (req, res) => {
  try {
    const { videoId } = req.params;
    if (!videoId) {
      throw new Error("video not found");
    }

    const video = await Video.findById(videoId);
    if (!video) {
      throw new Error("video not exist");
    }

    const likedVideo = await Like.findOne({
      $and: [{ video: videoId }, { likedBy: req.user._id }],
    });

    if (!likedVideo) {
      const likeDone = await Like.create({
        video: videoId,
        likedBy: req.user._id,
      });
      return res.status(200).json({
        message: "liked",
        data: likeDone,
      });
    }

    const deletedLike = await Like.findByIdAndDelete(likedVideo._id);
    if (!deletedLike) {
      throw new Error("something went wrong while deleting like");
    }

    res.status(200).json({
      message: "unliked",
      data: deletedLike,
    });
  } catch (error) {
    res.status(500).send("" + error);
  }
};

const toggleCommentLike = async (req, res) => {
  try {
    const { commentId } = req.params;
    if (!commentId) {
      throw new Error("comment not found");
    }
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new Error("comment not exist");
    }

    const likedComment = await Like.findOne({
      $and: [{ comment: commentId }, { likedBy: req.user._id }],
    });

    if (!likedComment) {
      const commentLikeDone = await Like.create({
        comment: commentId,
        likedBy: req.user._id,
      });
      return res.status(200).json({
        message: "comment liked",
        data: {
          _id: commentLikeDone._id,
          comment: commentLikeDone.comment,
          likedBy: commentLikeDone.likedBy,
          isLiked: true,
        },
      });
    }

    const commentUnlikeDone = await Like.findByIdAndDelete(likedComment._id);

    res.status(200).json({
      message: "comment unliked",
      data: {
        _id: commentUnlikeDone._id,
        comment: commentUnlikeDone.comment,
        likedBy: commentUnlikeDone.likedBy,
        isLiked: false,
      },
    });
  } catch (error) {
    res.status(500).send("" + error);
  }
};

const toggleTweetLike = async (req, res) => {
  try {
    const { tweetId } = req.params;
    if (!tweetId) {
      throw new Error("tweet not found");
    }
    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
      throw new Error("tweet not exist");
    }

    const likedTweet = await Like.findOne({
      $and: [{ tweet: tweetId }, { likedBy: req.user._id }],
    });

    if (!likedTweet) {
      const tweetLikeDone = await Like.create({
        tweet: tweetId,
        likedBy: req.user._id,
      });
      return res.status(200).json({
        message: "tweet liked",
        data: tweetLikeDone,
      });
    }

    const tweetUnlikeDone = await Like.findByIdAndDelete(likedTweet._id);

    res.status(200).json({
      message: "tweet unliked",
      data: tweetUnlikeDone,
    });
  } catch (error) {
    res.status(500).send("" + error);
  }
};

const getLikedVideos = async (req, res) => {
  try {
    const allLikedVideos = await Like.aggregate([
      {
        $match: {
          likedBy: new mongoose.Types.ObjectId(req.user._id),
          video: { $exists: true, $ne: null },
        },
      },
    
      {
        $lookup: {
          from: "videos",
          localField: "video",
          foreignField: "_id",
          as: "videoDetails",
        },
      },
      
      {
        $unwind: "$videoDetails",
      },
     
      {
        $lookup: {
          from: "users",
          localField: "videoDetails.owner",
          foreignField: "_id",
          as: "ownerDetails",
        },
      },
      
      {
        $unwind: "$ownerDetails",
      },
      
      {
        $project: {
          _id: "$videoDetails._id",
          title: "$videoDetails.title",
          description: "$videoDetails.description",
          duration: "$videoDetails.duration",
          views: "$videoDetails.views",
          isPublished: "$videoDetails.isPublished",
          thumbnail: "$videoDetails.thumbnail",
          videoFile: "$videoDetails.videoFile",
          createdAt: "$videoDetails.createdAt",
          updatedAt: "$videoDetails.updatedAt",
          __v: "$videoDetails.__v",
          owner: {
            _id: "$ownerDetails._id",
            fullName: "$ownerDetails.fullName",
            avatar: "$ownerDetails.avatar",
          },
        },
      },
    ]);

    res.status(200).json({
      message: "all liked videos fetched successfully",
      data: allLikedVideos,
    });
  } catch (error) {
    res.status(500).send("" + error);
  }
};

const checkTweetLike = async (req, res) => {
  try {
    const { tweetId } = req.params;
    const userId = req.user._id;

    const existingLike = await Like.findOne({
      tweet: tweetId,
      likedBy: userId
    });

    const likesCount = await Like.countDocuments({ tweet: tweetId });

    res.status(200).json({
      isLiked: !!existingLike,
      likesCount
    });
  } catch (error) {
    res.status(500).send('' + error);
  }
};

module.exports = {
  toggleVideoLike,
  toggleCommentLike,
  toggleTweetLike,
  getLikedVideos,
  checkTweetLike
};
