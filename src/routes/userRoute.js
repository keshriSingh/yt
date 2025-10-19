const express = require('express');
const { register, login, logout, refreshAccessToken, changeCurrentPassword, getUser, updateAccountDetails, updateUserCoverImage, updateUserAvatar, userChannelProfile, getWatchHistory } = require('../controllers/userController');
const { upload } = require('../middlewares/multerMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');

const userRouter = express.Router();

userRouter.post('/register',
    upload.fields([
       {
        name:'avatar',
        maxCount:1
       },
       {
        name:'coverImage',
        maxCount:1
       }

    ])
    ,register)

userRouter.post('/login',login)
userRouter.get('/logout',authMiddleware,logout)
userRouter.get('/refreshToken',refreshAccessToken)
userRouter.patch('/changePassword',authMiddleware,changeCurrentPassword)
userRouter.get('/profile',authMiddleware,getUser)
userRouter.patch('/editProfile',authMiddleware,updateAccountDetails)
userRouter.patch('/editAvatar',authMiddleware,upload.single("avatar"),updateUserAvatar)
userRouter.patch('/editCoverImage',authMiddleware,upload.single("coverImage"),updateUserCoverImage)
userRouter.get('/getChannel/:username',authMiddleware,userChannelProfile)
userRouter.get('/watchHistory',authMiddleware,getWatchHistory)


module.exports = userRouter;