const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { getAllVideo, publishAVideo, getVideoById, updateVideo } = require('../controllers/videoController');
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

module.exports = videoRouter