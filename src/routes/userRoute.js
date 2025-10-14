const express = require('express');
const { register, login, logout, refreshAccessToken, changeCurrentPassword } = require('../controllers/userController');
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
userRouter.post('/changePassword',authMiddleware,changeCurrentPassword)
userRouter.get('/profile',authMiddleware,getUser)
userRouter.post('/editProfile',authMiddleware,updateAccountDetails)
userRouter.post('/editAvatar',authMiddleware,updateUserAvatar)
userRouter.post('/editCoverImage',authMiddleware,updateUserCoverImage)


module.exports = userRouter;