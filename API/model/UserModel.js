const mongoose = require("mongoose")

const UserSchema = mongoose.Schema({
    username:{
        type:String,
        required:[true,"Name must be required"],
        unique:true
    },
    name:{
        type:String,
        required: [true,"Please provide your full name"]
    },
    email:{
        type: String,
        required: [true, "Email is required."],
    },
    pic:{
        type:String,
        default:"default-user.png"
    },
    password:{
        type:String,
        required:[true,"Password must be required"]
    }
})

const User = mongoose.model("User",UserSchema)
module.exports = User