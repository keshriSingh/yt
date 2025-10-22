const Comment = require("../models/commentModel");
const Video = require("../models/videoModel");
const { uploadOnCloudinary, deleteFromCloudinary, deleteVideoFromCloudinary } = require("../utils/cloudinary");


const getAllVideo = async(req,res)=>{
    try {
        const { page = 1, limit = 10, query, sortBy = 'createdAt', sortType = 'desc', userId } = req.query

        const pageNum = parseInt(page)
        const limitNum = parseInt(limit)
        const skip = (pageNum-1)*limitNum

        const searchConditions = {}

        if(query){
            searchConditions.$or = [
                {title:{ $regex:query, $options:"i" }},
                {description:{ $regex:query, $options:"i"}}
            ]
        }

        if (userId) {
            searchConditions.owner = userId;
        }

        searchConditions.isPublished = true

        const sortOrder = {};
        sortOrder[sortBy] = sortType === 'asc' ? 1 : -1

        const video = await Video.find(searchConditions)
        .sort(sortOrder)
        .skip(skip)
        .limit(limitNum)
        

        if(!video.length){
            return res.status(200).json({
                message:"Video not found"
            })
        }
        
        res.status(200).json({
            message:"successful",
            data:video
        })
    } catch (error) {
        res.status(500).send(""+error)
    }
}

const publishAVideo = async(req,res)=>{
    try {
        const { title, description } = req.body;
        if(!(title?.trim() && description?.trim())){
            throw new Error("fields are required")
        }

        const videoFileLoacalPath = req.files?.videoFile?.[0].path;
        const thumbnailLocalPath = req.files?.thumbnail?.[0].path;

        if(!videoFileLoacalPath){
            throw new Error("Video File is required")
        }

        if(!thumbnailLocalPath){
            throw new Error("thumbnail File is required")
        }

        const videoFile = await uploadOnCloudinary(videoFileLoacalPath);
        if(!videoFile){
            throw new Error("something went wrong while uplodind video File")
        }

        const thumbnailFile = await uploadOnCloudinary(thumbnailLocalPath);
        if(!thumbnailFile){
            throw new Error("something went wrong while uploding thumbnail file")
        }

        const video = await Video.create({
            videoFile:videoFile?.url,
            thumbnail: thumbnailFile?.url,
            title:title,
            description:description,
            duration:videoFile?.duration,
            owner:req.user._id
         })
         res.status(201).json({
            data:video
         })

    } catch (error) {
        res.status(500).send(""+error)
    }
}

const getVideoById = async(req,res)=>{
    try {
        const {videoId} = req.params;
        const video = await Video.findById(videoId)
        if(!video){
            throw new Error("Video does not exist")
        }
        res.status(200).json({
            data:video
        })
    } catch (error) {
        res.status(500).send(""+error)
    }
}

const updateVideo = async(req,res)=>{
    try {

        const {videoId} = req.params;
        const video = await Video.findById(videoId)
        if(!video){
            throw new Error("Video does not exist")
        }
        if(video.owner.toString()!==req.user._id.toString()){
            throw new Error("You can not make changes in this video")
        }
        const { title,description } = req.body;
         if(!(title?.trim() && description?.trim())){
            throw new Error("fields are required")
        }

        const videoFileLoacalPath = req.files?.videoFile?.[0].path;
        const thumbnailLocalPath = req.files?.thumbnail?.[0].path;
        
        let oldVideoPath = video.videoFile;
        let oldThumbnailPath = video.thumbnail;
        let oldDuration = video.duration

        if(videoFileLoacalPath){
            const videoFile = await uploadOnCloudinary(videoFileLoacalPath);
            if(!videoFile){
                throw new Error("something went wrong while uplodind video File")
            }
            await deleteVideoFromCloudinary(oldVideoPath)
            oldVideoPath = videoFile?.url
            oldDuration = videoFile?.duration
        }

        if(thumbnailLocalPath){
            const thumbnailFile = await uploadOnCloudinary(thumbnailLocalPath);
            if(!thumbnailFile){
                throw new Error("something went wrong while uplodind thumbnail File")
            }
            await deleteFromCloudinary(oldThumbnailPath)
            oldThumbnailPath = thumbnailFile?.url
        }

        const updatedVideo = await Video.findByIdAndUpdate(videoId,{
            $set:{
                title:title,
                description:description,
                videoFile:oldVideoPath,
                thumbnail:oldThumbnailPath,
                duration:oldDuration
            }
        },{new:true})

        res.status(201).json({
            data:updatedVideo
        })


    } catch (error) {
        res.status(500).send(""+error)
    }
}

const deleteVideo = async(req,res)=>{
    try {
        const {videoId} = req.params;
        const video = await Video.findById(videoId)
        if(!video){
            throw new Error("Video does not exist")
        }
        if(video.owner.toString()!==req.user._id.toString()){
            throw new Error("You can not delete this video")
        }
        await deleteVideoFromCloudinary(video.videoFile)
        await deleteFromCloudinary(video.thumbnail)

        await Comment.findByIdAndDelete({video:videoId})
        const deletedVideo = await Video.deleteOne({_id:videoId})

        res.status(200).json({
            data:deletedVideo
        })

    } catch (error) {
        res.status(500).send(""+error)
    }
}

const togglePublishStatus = async(req,res)=>{
    try {
        const {videoId} = req.params
        if(!videoId){
            throw new Error("video does not exist")
        }
        const video = await Video.findById(videoId)
        if(!video){
            throw new Error("video does not exist")
        }
        if(video.owner.toString()!==req.user._id.toString()){
            throw new Error("You can not delete this video")
        }

        video.isPublished = !video.isPublished
        await video.save({validateBeforeSave:false});
        res.status(200).json({
            data:video
        })

    } catch (error) {
        res.status(500).send(""+error)
    }
}

module.exports = { getAllVideo,publishAVideo,getVideoById,updateVideo,deleteVideo,togglePublishStatus }