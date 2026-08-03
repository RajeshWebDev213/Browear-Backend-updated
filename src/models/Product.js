import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
{
    name:{
        type:String,
        required:true,
        trim:true,
    },

    description:{
        type:String,
        required:true,
    },

    category:{
        type:String,
        required:true,
    },

    brand:{
        type:String,
        required:true,
    },

    price:{
        type:Number,
        required:true,
    },

    discount:{
        type:Number,
        default:0,
    },

    stock:{
        type:Number,
        default:0,
    },

    image:{
        type:String,
        required:true,
    },

    public_id:{
        type:String,
        required:true,
    },

    isAvailable:{
        type:Boolean,
        default:true,
    }

},
{
    timestamps:true,
});

export default mongoose.model("Product",productSchema);