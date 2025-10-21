const mongoose = require('mongoose')
const aggregatePaginate = require('mongoose-aggregate-paginate-v2')

const { Schema } = mongoose;

const commentSchema = new Schema({
    content:{
        type:String,
        required:true
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    video:{
        type:Schema.Types.ObjectId,
        ref:"Video"
    }
},{timestamps:true})

commentSchema.plugin(aggregatePaginate)

const Comment = mongoose.model("Comment",commentSchema)

module.exports = Comment