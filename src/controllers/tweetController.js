const Tweet = require("../models/tweetModel")

const createTweet = async(req,res)=>{
    try {
        const { content } = req.body
        if(!content?.trim()){
            throw new Error("write something")
        }
        const tweet = await Tweet.create({
            content:content,
            owner:req.user._id
        })

        if(!tweet){
            throw new Error("something went wrong while creating tweet")
        }

        res.status(201).json({
            message:"Tweet created successfully",
            data:tweet
        })

    } catch (error) {
        res.status(500).send(''+error)
    }
}

const getUserTweets = async(req,res) =>{
    try {
        const { userId } = req.params
        if(!userId){
            throw new Error("user not found")
        }

        const tweets = await Tweet.find({owner:userId}).populate("owner","userName")
        if(!tweets.length){
            return res.status(200).json({
                message:"No tweets"
            })
        }

        res.status(200).json({
            message:"tweets fetch successfully",
            data:tweets
        })

    } catch (error) {
        res.status(500).send(''+error)
    }
}

const updateTweet = async(req,res)=>{
    try {
        const { tweetId } = req.params
        const { content } = req.body
        if(!tweetId){
            throw new Error("tweet does not exist")
        }
        if(!content?.trim()){
            throw new Error("please write something")
        }
        const tweet = await Tweet.findById(tweetId)
        if(!tweet){
            throw new Error("tweet does not exist")
        }

        if(req.user._id.toString()!==tweet.owner.toString()){
            throw new Error("you can not make change in this tweet")
        }

        tweet.content = content;
        await tweet.save();

        res.status(200).json({
            message:"tweet updated successfully",
            data:tweet
        })

    } catch (error) {
        res.status(500).send(''+error)
        
    }
}

const deleteTweet = async(req,res)=>{
    try {
        const {tweetId} = req.params
        if(!tweetId){
            throw new Error("Invalid tweet")
        }
        const tweet = await Tweet.findById(tweetId)
        if(!tweet){
            throw new Error("tweet does not exist")
        }
        if(req.user._id.toString() !== tweet.owner.toString()){
            throw new Error("you can not delte this tweet ")
        }

       const deletedTweet = await Tweet.findByIdAndDelete(tweetId)

       if(!deletedTweet){
        throw new Error("something went wrong while deleting tweet")
       }

       res.status(200).json({
        message:'tweet deleted successfully',
        data:deletedTweet
       })

    } catch (error) {
        res.status(500).send(''+error)
    }
}

module.exports = { createTweet,getUserTweets,updateTweet,deleteTweet }