const mongoose=require("mongoose")


require("dotenv").config()

module.exports.MongoDBconfig= async ()=>{
    try {
        await mongoose.connect("mongodb+srv://anzer:anzeradmin@cluster0.1gb4e29.mongodb.net/");
        console.log("MongoDB Connected Successfully ✅");
    } catch (error) {
        console.error("MongoDB Connection Failed ❌", error.message);
    }

}
