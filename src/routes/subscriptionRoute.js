const express = require('express')
const authMiddleware = require('../middlewares/authMiddleware')
const { toggleSubscription, getSubscribedChannels, getUserChannelSubscribers } = require('../controllers/subscriptionController')

const subscriptionRouter = express.Router()

subscriptionRouter.use(authMiddleware)

subscriptionRouter.post('/:channelId',toggleSubscription)
subscriptionRouter.get('/getSubscribers/:channelId',getUserChannelSubscribers)
subscriptionRouter.get('/subscribedChannels',getSubscribedChannels)

module.exports = subscriptionRouter