const express = require('express')
const authMiddleware = require('../middlewares/authMiddleware')
const { createTweet, getUserTweets, updateTweet, deleteTweet } = require('../controllers/tweetController')

const tweetRouter = express.Router()

tweetRouter.use(authMiddleware)

tweetRouter.post('/create',createTweet)
tweetRouter.get('/user/:userId',getUserTweets)
tweetRouter.patch('/:tweetId',updateTweet)
tweetRouter.delete('/:tweetId',deleteTweet)

module.exports = tweetRouter