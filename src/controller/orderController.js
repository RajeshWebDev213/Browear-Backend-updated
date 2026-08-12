import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";
import User from "../models/User.js";
import sendOrderEmail from "../services/orderService.js";
// PLACE ORDER (COD)
export const placeOrder = async (req, res) => {

    try {

        const {

            fullname,
            phone,
            address,
            city,
            state,
            pincode,
            country = "India",

        } = req.body;

        if (
            !fullname ||
            !phone ||
            !address ||
            !city ||
            !state ||
            !pincode
        ) {
            return res.status(400).json({
                success: false,
                message: "Shipping address is required",
            });
        }

        const cartItems = await Cart.find({
            user: req.user._id,
        }).populate("product");

        if (cartItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Cart is empty",
            });
        }

        let subtotal = 0;
        let discount = 0;

        const orderItems = [];

        for (const item of cartItems) {

            const product = item.product;

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found",
                });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `${product.name} has only ${product.stock} items left`,
                });
            }

            const finalPrice = product.price - (product.price * product.discount) / 100;

            subtotal += finalPrice * item.quantity;

            discount +=
                (product.price - finalPrice) *
                item.quantity;

           orderItems.push({

    product: product._id,

    name: product.name,

    image: product.images[0]?.url || "",

    price: finalPrice,

    quantity: item.quantity,

    size: item.size,

});

        }

        const shipping =
            subtotal >= 999 ? 0 : 99;

        const tax =
            Number((subtotal * 0.18).toFixed(2));

        const totalPrice =
            subtotal +
            shipping +
            tax;

        const order = await Order.create({

            user: req.user._id,

            orderItems,

            shippingAddress: {

                fullname,

                phone,

                address,

                city,

                state,

                pincode,

                country,

            },

            paymentMethod: "COD",

            subtotal,

            discount,

            shipping,

            tax,

            totalPrice,

        });

        // Reduce Stock

        for (const item of cartItems) {

            await Product.findByIdAndUpdate(

                item.product._id,

                {
                    $inc: {
                        stock: -item.quantity,
                    },
                }

            );

        }

        // Clear Cart

        await Cart.deleteMany({
            user: req.user._id,
        });

        return res.status(201).json({

            success: true,

            message: "Order placed successfully",

            order,

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: "Internal Server Error",

        });

    }

};
// GET MY ORDERS
export const getMyOrders = async (req, res) => {

    try {

        const orders = await Order.find({
            user: req.user._id,
        })
        .sort({
            createdAt: -1,
        });

        return res.status(200).json({

            success: true,

            count: orders.length,

            orders,

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: "Internal Server Error",

        });

    }

};
// GET SINGLE ORDER
export const getSingleOrder = async (req, res) => {

    try {

        const { orderId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {

            return res.status(400).json({
                success: false,
                message: "Invalid Order ID",
            });

        }

        const order = await Order.findOne({

            _id: orderId,

            user: req.user._id,

        });

        if (!order) {

            return res.status(404).json({

                success: false,

                message: "Order not found",

            });

        }

        return res.status(200).json({

            success: true,

            order,

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: "Internal Server Error",

        });

    }

};
// ADMIN GET SINGLE ORDER
export const getAdminSingleOrder = async (req, res) => {

    try {

        const { orderId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {

            return res.status(400).json({

                success: false,

                message: "Invalid Order ID",

            });

        }

        const order = await Order.findById(orderId)

            .populate(
                "user",
                "fullname email phone avatar"
            );

        if (!order) {

            return res.status(404).json({

                success: false,

                message: "Order not found",

            });

        }

        return res.status(200).json({

            success: true,

            order,

        });

    }

    catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: "Internal Server Error",

        });

    }

};
// CANCEL ORDER
export const cancelOrder = async (req, res) => {

    try {

        const { orderId } = req.params;
        const {

    reason,

    customReason,

} = req.body;
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Order ID",
            });
        }
       if (!reason) {

    return res.status(400).json({

        success: false,

        message: "Please select a cancellation reason.",

    });

}

if (
    reason === "Other" &&
    !customReason?.trim()
) {

    return res.status(400).json({

        success: false,

        message: "Please enter your cancellation reason.",

    });

}
        const order = await Order.findOne({
            _id: orderId,
            user: req.user._id,
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        // Prevent cancelling shipped or delivered orders
        if (
            order.orderStatus === "Shipped" ||
            order.orderStatus === "Out for Delivery" ||
            order.orderStatus === "Delivered"
        ) {
            return res.status(400).json({
                success: false,
                message: `Order cannot be cancelled because it is ${order.orderStatus}.`,
            });
        }

        // Already cancelled
        if (order.orderStatus === "Cancelled") {
            return res.status(400).json({
                success: false,
                message: "Order is already cancelled.",
            });
        }

        // Restore product stock
        for (const item of order.orderItems) {

            await Product.findByIdAndUpdate(
                item.product,
                {
                    $inc: {
                        stock: item.quantity,
                    },
                }
            );

        }

        order.orderStatus = "Cancelled";

order.cancelReason =

    reason === "Other"

        ? customReason

        : reason;

order.cancelledAt = new Date();

        await order.save();
        const user = await User.findById(order.user);

await sendOrderEmail(

    user.email,

    "Order Cancelled",

    "Your Order has been Cancelled",

    `Your order #${order._id}
has been cancelled successfully.

Reason:
${order.cancelReason}`


);

        return res.status(200).json({

            success: true,

            message: "Order cancelled successfully.",

            order,

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: "Internal Server Error",

        });

    }

};
// ADMIN - GET ALL ORDERS
export const getAllOrders = async (req, res) => {

    try {

        const orders = await Order.find()
            .populate("user", "fullname email")
            .sort({ createdAt: -1 });

        return res.status(200).json({

            success: true,

            count: orders.length,

            orders,

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: "Internal Server Error",

        });

    }

};
// ADMIN - UPDATE ORDER STATUS
export const updateOrderStatus = async (req, res) => {

    try {

        const { orderId } = req.params;

        const { orderStatus } = req.body;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {

            return res.status(400).json({

                success: false,

                message: "Invalid Order ID",

            });

        }

        const allowedStatus = [

            "Pending",

            "Confirmed",

            "Shipped",

            "Out for Delivery",

            "Delivered",

            "Cancelled",

        ];

        if (!allowedStatus.includes(orderStatus)) {

            return res.status(400).json({

                success: false,

                message: "Invalid Order Status",

            });

        }

        const order = await Order.findById(orderId);

        if (!order) {

            return res.status(404).json({

                success: false,

                message: "Order not found",

            });

        }

        // Already Delivered
        if (order.orderStatus === "Delivered") {

            return res.status(400).json({

                success: false,

                message: "Delivered order cannot be updated.",

            });

        }

        // Already Cancelled
        if (order.orderStatus === "Cancelled") {

            return res.status(400).json({

                success: false,

                message: "Cancelled order cannot be updated.",

            });

        }

        order.orderStatus = orderStatus;

        // Payment completed after delivery (COD)
        if (
            orderStatus === "Delivered" &&
            order.paymentMethod === "COD"
        ) {

            order.paymentStatus = "Paid";

        }

        await order.save();
        const user = await User.findById(order.user);

await sendOrderEmail(

    user.email,

    `Order ${orderStatus}`,

    `Your Order is ${orderStatus}`,

    `Your order #${order._id}
     status has been updated to
     "${orderStatus}".`

);

        return res.status(200).json({

            success: true,

            message: "Order status updated successfully.",

            order,

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: "Internal Server Error",

        });

    }

};
// ADMIN - ORDER STATISTICS
export const getOrderStats = async (req, res) => {

    try {

        const totalOrders = await Order.countDocuments();

        const pendingOrders =
            await Order.countDocuments({
                orderStatus: "Pending",
            });

        const confirmedOrders =
            await Order.countDocuments({
                orderStatus: "Confirmed",
            });

        const shippedOrders =
            await Order.countDocuments({
                orderStatus: "Shipped",
            });

        const deliveredOrders =
            await Order.countDocuments({
                orderStatus: "Delivered",
            });

        const cancelledOrders =
            await Order.countDocuments({
                orderStatus: "Cancelled",
            });

        const revenue = await Order.aggregate([
            {
                $match: {
                    paymentStatus: "Paid",
                },
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: {
                        $sum: "$totalPrice",
                    },
                },
            },
        ]);

        const recentOrders = await Order.find()
            .populate("user", "fullname email")
            .sort({ createdAt: -1 })
            .limit(5);

        return res.status(200).json({

            success: true,

            statistics: {

                totalOrders,

                pendingOrders,

                confirmedOrders,

                shippedOrders,

                deliveredOrders,

                cancelledOrders,

                totalRevenue:
                    revenue.length > 0
                        ? revenue[0].totalRevenue
                        : 0,

            },

            recentOrders,

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: "Internal Server Error",

        });

    }

};