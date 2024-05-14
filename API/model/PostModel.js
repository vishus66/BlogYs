const mongoose = require("mongoose")

const PostCreat  =  new mongoose.Schema({
    title:{
        type:String,
        required:[true,"Title must be required"]
    },
    summary:{
        type:String,
        required:[true,"Summary must be required"]
    },
    content:{
        type:String,
        required:[true,"Content must be required"]
    },
    pic:{
        type:String,
        required:[true,"file must be required"]
    },
    bio:{
        type:String,
        required:[true,"Author-Bio must be required"]

    },
    author:{type:mongoose.Schema.Types.ObjectId ,ref:"User"}
},{timestamps:true})

const Post = new mongoose.model('Post',PostCreat)
module.exports = Post

// timestamps:true:-Mongoose schemas support a timestamps option. If you set timestamps: true, Mongoose will add two properties of type Date to your schema:

// createdAt: a date representing when this document was created
// updatedAt: a date representing when this document was last updated