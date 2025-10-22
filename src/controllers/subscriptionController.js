const Subscription = require("../models/subscriptionModel")

const toggleSubscription = async(req,res) =>{
    try {
        const { channelId } = req.params
        if(!channelId){
            throw new Error('channelId does not exist')
        }
        
        const docs = await Subscription.findOne(
            {
                $and:[
                    {subscriber:req.user._id},
                    {channel:channelId}
                ]
            }
        )

        if(!docs){
            const newSubscriber = await Subscription.create({
                subscriber:req.user._id,
                channel:channelId
            })

            return res.status(201).json({
                message:"channel Subscribed",
                data:newSubscriber
            })
        }

        const deletedSubscriber = await Subscription.findByIdAndDelete(docs._id)

        res.status(200).json({
            message:"channel Unsubscribed",
            data:deletedSubscriber
        })

    } catch (error) {
        res.status(500).send(""+error)
    }
}

const getUserChannelSubscribers = async(req,res)=>{
    try {
        const { channelId } = req.params
        if(!channelId){
            throw new Error("channel not found")
        }
        const totalSubscribers = await Subscription.find({channel:channelId}).populate("subscriber","userName avatar email")

        res.status(200).json({
            message:"subscriber fetched successfully",
            data:totalSubscribers
        })

    } catch (error) {
        res.status(500).send(''+error)
    }
}

const getSubscribedChannels = async(req,res)=>{
    try {
        const channels =  await Subscription.find({subscriber:req.user._id}).populate("channel","userName avatar email").select("channel")
        if(!channels.length){
            return res.status(200).json({
                message:"no channel subscribed"
            })
        }

        res.status(200).json({
            message:'channel fetched successfully',
            data:channels
        })

    } catch (error) {
        res.status(500).send(""+error)
    }
}



module.exports = { toggleSubscription,getUserChannelSubscribers,getSubscribedChannels }