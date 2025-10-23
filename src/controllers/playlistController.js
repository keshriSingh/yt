const Playlist = require("../models/playlistModel")
const Video = require("../models/videoModel")

const createPlaylist = async(req,res)=>{
    try {
        const { name,description } = req.body
        if(!(name?.trim()&&description?.trim())){
            throw new Error("fields are required")
        }
        const newPlaylist = await Playlist.create({
            name,
            description,
            owner:req.user._id
        })
        if(!newPlaylist){
            throw new Error("something went while creating playlist")
        }

        res.status(201).json({
            message:"new playlist created successfully",
            data:newPlaylist
        })

    } catch (error) {
        res.status(500).send(""+error)
    }
}

const getUserPlaylists = async(req,res)=>{
    try {
        const { userId } = req.params
        if(!userId){
            throw new Error("user not found")
        }
        const allPlaylist = await Playlist.find({
            owner:userId
        }).select("-owner").sort({createdAt:-1})
        if(!allPlaylist){
            throw new Error("something went worng while fetching playlist")
        }

        res.status(200).json({
            message:"all Playlist fetched",
            data:allPlaylist
        })

    } catch (error) {
        res.status(500).send(""+error)
    }
}

const getPlaylistById = async(req,res)=>{
    try {
        const { playlistId } = req.params
        if(!playlistId){
            throw new Error("playlist not found")
        }
        const playlist = await Playlist.findById(playlistId)
        if(!playlist){
            throw new Error("playlist not exists")
        }
        res.status(200).json({
            message:"playlist fetched successfully",
            data:playlist
        })
    } catch (error) {
        res.status(500).send(""+error)
    }
}

const addVideoToPlaylist = async(req,res)=>{
    try {
        const { videoId,playlistId } = req.params
        if(!(videoId?.trim()&&playlistId.trim())){
            throw new Error("video or playlist not found")
        }
        const playlistExists = await Playlist.findById(playlistId)
        if(!playlistExists){
            throw new Error("playlist not exists")
        }
        const videoExists = await Video.findById(videoId)
        if(!videoExists){
            throw new Error("video not exists")
        }

        if(playlistExists.videos.includes(videoId)){
           return res.status(409).json({
            message: "This video already exists in this playlist",
        });
        }

        playlistExists.videos.push(videoId)
        await playlistExists.save()

        res.status(201).json({
            message:"video added in playlist",
            data:playlistExists
        })

    } catch (error) {
        res.status(500).send(""+error)
    }
}

const removeVideoFromPlaylist = async(req,res)=>{
    try {
        const { videoId,playlistId } = req.params
        if(!(videoId?.trim()&&playlistId.trim())){
            throw new Error("video or playlist not found")
        }
        const playlistExists = await Playlist.findById(playlistId)
        if(!playlistExists){
            throw new Error("playlist not exists")
        }

        if(!playlistExists.videos.includes(videoId)){
            return res.status(409).json({
                message: "This video is not exists in this playlist",
            });
        }

        const index = playlistExists.videos.indexOf(videoId)
        if(index > -1){
            playlistExists.videos.splice(index,1)
            await playlistExists.save()
        }

        res.status(200).json({
            message:"video deleted successfully",
            data:playlistExists
        })

    } catch (error) {
        res.status(500).send(""+error)
    }
}

const deletePlaylist = async(req,res)=>{
    try {
        const { playlistId } = req.params
        if(!playlistId){
            throw new Error("playlist not found")
        }
        const deletedPlaylist = await Playlist.findById(playlistId)
        if(!deletedPlaylist){
            return res.status(409).json({
                message:"playlist not exists"
            })
        }
        await Playlist.findByIdAndDelete(playlistId)
        res.status(200).json({
            message:"playlist deleted successfully",
            data:deletedPlaylist
        })
    } catch (error) {
        res.status(500).send(''+error)
    }
}

const updatePlaylist = async(req,res)=>{
    try {
        const { playlistId } = req.params
        const { name,description } = req.body
        if(!playlistId){
            throw new Error("playlist not found")
        }
        if(!(name?.trim()&&description?.trim())){
            throw new Error("fields are required")
        }

        const playlistExists = await Playlist.findById(playlistId)
        if(!playlistExists){
            res.status(409).json({
                message:"playlist does not exists"
            })
        }

        playlistExists.name = name
        playlistExists.description = description
        await playlistExists.save()

        res.status(201).json({
            message:"playlist updated successfully",
            data:playlistExists
        })
        
    } catch (error) {
        res.status(500).send(""+error)
    }
}

module.exports = { createPlaylist,getUserPlaylists,getPlaylistById,addVideoToPlaylist,removeVideoFromPlaylist,deletePlaylist,updatePlaylist }