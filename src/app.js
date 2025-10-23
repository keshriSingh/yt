const express = require('express')
const cors = require('cors');
const  cookieParser = require('cookie-parser')

const app = express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}));

app.use(express.json({limit:'20kb'}));

app.use(express.urlencoded({extended:true,limit:'20kb'}));

app.use(express.static('public'));

app.use(cookieParser());


//import routes
const userRouter = require('./routes/userRoute');
const videoRouter = require('./routes/videoRoute');
const commentRouter = require('./routes/commentRoute');
const tweetRouter = require('./routes/tweetRoute');
const subscriptionRouter = require('./routes/subscriptionRoute');
const likeRouter = require('./routes/likeRoute');
const playlistRoute = require('./routes/playlistRoute');


app.use('/user',userRouter)
app.use('/video',videoRouter)
app.use('/comment',commentRouter)
app.use('/tweet',tweetRouter)
app.use('/subscription',subscriptionRouter)
app.use('/like',likeRouter)
app.use('/playlist',playlistRoute)

module.exports = {app}