const mongoose = require("mongoose")

async function getConnect(req,res){
    try {
        mongoose.connect("mongodb://localhost:27017/BlogY")
        console.log("Server is connecting to database....")
    } catch (error) {
        console.log(error)        
    }
}

getConnect()