const express = require('express')
const authMiddleware = require('../middlewares/authMiddleware')
const { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos } = require('../controllers/likeController')

const likeRouter = express.Router()

likeRouter.use(authMiddleware)

likeRouter.post('/video/:videoId', toggleVideoLike)
likeRouter.post('/comment/:commentId', toggleCommentLike)
likeRouter.post('/tweet/:tweetId', toggleTweetLike)
likeRouter.get('/all', getLikedVideos)

module.exports = likeRouter