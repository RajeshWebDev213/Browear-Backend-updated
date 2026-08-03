import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({

    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },

    orderItems:[
        {

            product:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"Product",
                required:true,
            },

            name:{
                type:String,
                required:true,
            },

            image:{
                type:String,
                required:true,
            },

            price:{
                type:Number,
                required:true,
            },

            quantity:{
                type:Number,
                required:true,
            }

        }
    ],

    shippingAddress:{

        fullname:String,

        phone:String,

        address:String,

        city:String,

        state:String,

        pincode:String,

        country:{
            type:String,
            default:"India",
        }

    },

    paymentMethod:{
        type:String,
        enum:["COD","ONLINE"],
        default:"COD",
    },

    paymentStatus:{
        type:String,
        enum:[
            "Pending",
            "Paid",
            "Failed"
        ],
        default:"Pending",
    },

    orderStatus:{
        type:String,
        enum:[
            "Pending",
            "Confirmed",
            "Shipped",
            "Out for Delivery",
            "Delivered",
            "Cancelled",
        ],
        default:"Pending",
    },

    subtotal:Number,

    discount:Number,

    shipping:Number,

    tax:Number,

    totalPrice:Number,

},{
    timestamps:true,
});

export default mongoose.model(
    "Order",
    orderSchema
);