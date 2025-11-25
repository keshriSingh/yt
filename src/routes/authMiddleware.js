const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const authMiddleware = async (req,res,next)=>{
    try {
        const token = req.cookies?.accessToken;
        if(!token){
            throw new Error("Invalid token")
        }
        const payload = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)

        const {_id} = payload;
        if(!_id){
            throw new Error("Invalid token")
        }

        const user = await User.findById(_id)

        if(!user){
            throw new Error("User does not exist")
        }
        
        req.user = user;
        next()

    } catch (error) {
        res.status(401).send(""+error);
    }
}

module.exports = authMiddleware;