const Comment = require("../models/commentModel")
const Video = require("../models/videoModel")

const getVideoComments = async(req,res)=>{
    try {
        const { videoId } = req.params

        if(!videoId){
            throw new Error("video not found")
        }

        const { page = 1, limit = 10} = req.query
        const pageNum = parseInt(page)
        const limitNum = parseInt(limit)
        const skip = (pageNum-1)*limitNum

        const video = await Video.findById(videoId)

        if(!video){
            throw new Error("video does not exist")
        }

        const comments = await Comment.find({video:videoId})
        .sort({createdAt: -1})
        .skip(skip)
        .limit(limitNum)
        .populate('owner','userName email avatar')
        .populate('video','title description')

        if(!comments.length){
           return res.status(200).json({
                message:"comments does not exist"
            })
        }

        res.status(200).json({
            data:comments
        })

    } catch (error) {
        res.status(500).send(""+error)
    }
}

const addComment = async(req,res)=>{
    try {
        const {videoId} = req.params
        const {content} = req.body
        if(!videoId){
            throw new Error("Video not found")
        }

        if(!content?.trim()){
            throw new Error("please write something")
        }

        const video = await Video.findById(videoId)
        if(!video){
            throw new Error("video does not exist")
        }

        const comment = await Comment.create({
            content:content,
            owner:req.user._id,
            video:video._id
        })

        if(!comment){
            throw new Error("something went wrong while adding data in mongodb")
        }

        res.status(201).json({
            message:"Comment added successfully",
            data:comment
        })

    } catch (error) {
        res.status(500).send(""+error)
    }
}

const updateComment = async(req,res)=>{
    try {

        const {commentId} = req.params
        const { content } = req.body

        if(!commentId){
            throw new Error("video not found")
        }
        if(!content?.trim()){
            throw new Error("please write something")
        }

        const comment = await Comment.findById(commentId)
        if(!comment){
            throw new Error("video does not exist")
        }

        const updatedComment = await Comment.findByIdAndUpdate(commentId,
            {
                $set:{
                    content
                }
            },
            {new:true}
        )
        if(!updatedComment){
            throw new Error("something went wrong")
        }

        res.status(201).json({
            message:"updated",
            data:updatedComment
        })

    } catch (error) {
        res.status(500).send(""+error)
    }
}

const deleteComment = async(req,res)=>{
    try {
        const {commentId} = req.params
        if(!commentId){
            throw new Error("comment not found")
        }

        const comment = await Comment.findById(commentId)
        if(!comment){
            throw new Error("comment does not exist")
        }
        if(req.user._id.toString()!==comment.owner.toString()){
            throw new Error("you can not delete this Comment")
        }

        const deletedComment = await Comment.findByIdAndDelete(commentId)
        if(!deleteComment){
            throw new Error("something went wrong while deleting comment")
        }

        res.status(200).json({
            message:"deleted successfully",
            data:deletedComment
        })

    } catch (error) {
        res.status(500).send(""+error)
    }
}

module.exports = { getVideoComments,addComment,updateComment,deleteComment }