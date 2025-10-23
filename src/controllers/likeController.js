const Comment = require("../models/commentModel")
const Like = require("../models/likeModel")
const Tweet = require("../models/tweetModel")
const Video = require("../models/videoModel")

const toggleVideoLike = async(req,res)=>{
    try {
        const { videoId } = req.params
        if(!videoId){
            throw new Error("video not found")
        }

        const video = await Video.findById(videoId)
        if(!video){
            throw new Error("video not exist")
        }

        const likedVideo = await Like.findOne({
            $and:[
                {video:videoId},
                {likedBy:req.user._id}
            ]
        })

        if(!likedVideo){
            const likeDone = await Like.create({
                video:videoId,
                likedBy:req.user._id
            })
            return res.status(200).json({
                message:"liked",
                data:likeDone
            })
        }

        const deletedLike = await Like.findByIdAndDelete(likedVideo._id)
        if(!deletedLike){
            throw new Error("something went wrong while deleting like")
        }

        res.status(200).json({
            message:"unliked",
            data:deletedLike
        })

    } catch (error) {
        res.status(500).send(""+error)
    }
}

const toggleCommentLike = async(req,res)=>{
    try {
        const {commentId} = req.params
        if(!commentId){
            throw new Error("comment not found")
        }
        const comment = await Comment.findById(commentId)
        if(!comment){
            throw new Error("comment not exist")
        }

        const likedComment = await Like.findOne({
            $and:[
                {comment:commentId},
                {likedBy:req.user._id}
            ]
        })

        if(!likedComment){
            const commentLikeDone = await Like.create({
                comment:commentId,
                likedBy:req.user._id
            })
            return res.status(200).json({
                message:"comment liked",
                data:commentLikeDone
            })
        }

        const commentUnlikeDone = await Like.findByIdAndDelete(likedComment._id)

        res.status(200).json({
            message:"comment unliked",
            data:commentUnlikeDone
        })


    } catch (error) {
        res.status(500).send(""+error)
    }
}

const toggleTweetLike = async(req,res)=>{
    try {
         const {tweetId} = req.params
        if(!tweetId){
            throw new Error("tweet not found")
        }
        const tweet = await Tweet.findById(tweetId)
        if(!tweet){
            throw new Error("tweet not exist")
        }

        const likedTweet = await Like.findOne({
            $and:[
                {tweet:tweetId},
                {likedBy:req.user._id}
            ]
        })

        if(!likedTweet){
            const tweetLikeDone = await Like.create({
                tweet:tweetId,
                likedBy:req.user._id
            })
            return res.status(200).json({
                message:"tweet liked",
                data:tweetLikeDone
            })
        }

        const tweetUnlikeDone = await Like.findByIdAndDelete(likedTweet._id)

        res.status(200).json({
            message:"tweet unliked",
            data:tweetUnlikeDone
        })

    } catch (error) {
        res.status(500).send(''+error)
    }
}

const getLikedVideos = async(req,res)=>{
    try {
        const allLikedVideos = await Like.find({
            likedBy:req.user._id,
            video:{ $exists:true }
        }).populate("video").select("video")

        res.status(200).json({
            message:"all liked videos fetched successfully",
            data:allLikedVideos
        })

    } catch (error) {
        res.status(500).send(''+error)
    }
}

module.exports = { toggleVideoLike,toggleCommentLike,toggleTweetLike,getLikedVideos }