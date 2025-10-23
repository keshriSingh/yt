const mongoose = require('mongoose')
const Video = require("../models/videoModel")
const Subscription = require("../models/subscriptionModel")
const Like = require("../models/likeModel")
const Comment = require("../models/commentModel")

const getChannelStats = async(req,res)=>{
    try {
        
        // totalVideosCount
        const totalVideosCount = await Video.countDocuments({owner:req.user._id})

        // totalVideosViews
        const totalVideosViews = await Video.aggregate([
            { $match:{ owner:new mongoose.Types.ObjectId(req.user._id) }},
            { $group:{ _id:null, totalViews:{$sum:"$views"}}}
        ])

        const totalViews = totalVideosViews[0]?.totalViews || 0

        //totalSubscribers
        const totalSubscribers = await Subscription.countDocuments({channel:req.user._id})

        //getTotalLikesOnAllVideos
        const totalLikes = await Like.countDocuments({
            video:{ $in:await Video.find({owner:req.user._id}).distinct('_id')}
        })

        //getTotalCommentsOnAllVideos
        const totalComments = await Comment.countDocuments({
            video:{ $in:await Video.find({owner:req.user._id}).distinct('_id')}
        })

        //getMostPopularVideo
        const mostPopularVideo = await Video.findOne({ owner: req.user._id })
        .sort({ views: -1 })
        .select('title views');

        const stats = {
            totalVideosCount,
            totalViews,
            totalSubscribers,
            totalLikes,
            totalComments,
            mostPopularVideo: mostPopularVideo ? {
                title: mostPopularVideo.title,
                views: mostPopularVideo.views
            } : null
        };

        res.status(200).json({
            message:"stats fetched successfully",
            data:stats
        })


    } catch (error) {
        res.status(500).send(""+error)
    }
}

const getChannelVideos = async(req,res)=>{
    try {
        const allVideos = await Video.find({
            owner:req.user._id
        }).sort({ createdAt: -1 })
        if(!allVideos){
            throw new Error("something went wrong")
        }

        res.status(200).json({
            message:"all video fetched successfully",
            data:allVideos
        })

    } catch (error) {
        res.status(500).send(""+error)
    }
}

module.exports = { getChannelStats,getChannelVideos }