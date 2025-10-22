const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { getVideoComments, addComment, updateComment, deleteComment } = require('../controllers/commentController');

const commentRouter = express.Router()

commentRouter.use(authMiddleware)

commentRouter.get("/:videoId",getVideoComments)
commentRouter.post("/:videoId",addComment)
commentRouter.patch("/:commentId",updateComment)
commentRouter.delete('/:commentId',deleteComment)

module.exports = commentRouter;