const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { getAllVideo, publishAVideo, getVideoById, updateVideo, deleteVideo, togglePublishStatus } = require('../controllers/videoController');
const { upload } = require('../middlewares/multerMiddleware');

const videoRouter = express.Router();

videoRouter.get("/all",authMiddleware,getAllVideo)
videoRouter.post("/publishVideo",authMiddleware,upload.fields([
    {
        name:"videoFile",
        maxCount:1
    },
    {
        name:"thumbnail",
        maxCount:1
    }
]),publishAVideo)
videoRouter.get("/:videoId",authMiddleware,getVideoById)
videoRouter.patch("/:videoId",authMiddleware,upload.fields([
    {
        name:"videoFile",
        maxCount:1
    },
    {
        name:"thumbnail",
        maxCount:1
    }
]),updateVideo)
videoRouter.delete("/:videoId",authMiddleware,deleteVideo)
videoRouter.patch("/toggle/:videoId",authMiddleware,togglePublishStatus)

module.exports = videoRouter