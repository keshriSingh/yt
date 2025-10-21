const mongoose = require("mongoose")

const { Schema } = mongoose;

const PlaylistSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    videos:[
        {
            type:Schema.Types.ObjectId,
            ref:"Video"
        }
    ]
},{timestamps:true})

const Playlist = mongoose.model("Playlist",PlaylistSchema)

module.exports = Playlist