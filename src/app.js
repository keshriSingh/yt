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


app.use('/user',userRouter)
app.use('/video',videoRouter)
app.use('/comment',commentRouter)

module.exports = {app}