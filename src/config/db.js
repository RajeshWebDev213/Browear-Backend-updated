import mongoose from "mongoose"
const connectDB = async()=>{
    try{
        mongoose.connect("mongodb://127.0.0.1:27017/browear");
        console.log("Browear database connected successfully");
    }catch(error){
        console.log(error.message);
        process.exit(1);
    
    }
}

export default connectDB;