const express = require('express');
const { register, login, logout } = require('../controllers/userController');
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


module.exports = userRouter;