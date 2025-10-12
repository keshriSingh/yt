const User = require("../models/userModel");
const { uploadOnCloudinary } = require("../utils/cloudinary");

const register = async (req,res)=>{
    try {
        
        const {userName,fullName,email,password} = req.body

        if([userName,fullName,email,password].some((field)=>field?.trim()==="")){
            throw new Error("All fields are required");
        }

        if(!email.includes('@')){
            throw new Error('Invalid Email')
        }

        const existedUser = await User.findOne({
            $or:[{ userName },{ email }]
        })

        if(existedUser){
            throw new Error("User allready existed")
        }

        const avatarLocalPath = req.files?.avatar[0].path;
        const coverImageLocalPath = req.files?.coverImage[0].path;

        if(!avatarLocalPath){
            throw new Error("Avtar file is required")
        }

        const avatar =  await uploadOnCloudinary(avatarLocalPath);
        const coverImage =  await uploadOnCloudinary(coverImageLocalPath);

        if(!avatar){
            throw new Error('avatar file is required')
        }

        const user = await User.create({
            fullName,
            avatar:avatar.url,
            coverImage:coverImage?.url||"",
            userName:userName.toLowerCase(),
            password,
            email
        })

        const createdUser = await User.findById(user._id).select('-password -refreshToken');
        if(!createdUser){
           return  res.status(500).json({
                message:"Failed to create user",
            })
        }

        res.status(201).json({
            data:createdUser
        })


    } catch (error) {
        res.status(500).send('error:'+error);
    }
}

module.exports = {register}