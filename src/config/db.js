import mongoose from "mongoose"
const connectDB = async()=>{
    try{
        mongoose.connect(process.env.MONGODB_URI);
        
        console.log("Browear database connected successfully");
    }catch(error){
        console.log(error.message);
        process.exit(1);
    
    }
}

export default connectDB;