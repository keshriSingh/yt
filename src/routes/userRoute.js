const express = require('express');
const { register } = require('../controllers/userController');
const { upload } = require('../middlewares/multerMiddleware')

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


module.exports = userRouter;