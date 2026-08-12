import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Review from "../models/Review.js";
// DASHBOARD OVERVIEW
export const dashboardOverview = async (req, res) => {

    try {

        const totalUsers =
            await User.countDocuments();

        const totalProducts =
            await Product.countDocuments();

        const totalOrders =
            await Order.countDocuments();

        const totalReviews =
            await Review.countDocuments();

        const deliveredOrders =
            await Order.find({
                orderStatus: "Delivered",
            });

        const totalRevenue =
            deliveredOrders.reduce(

                (sum, order) =>

                    sum + order.totalPrice,

                0

            );

        return res.status(200).json({

            success: true,

            dashboard: {

                totalUsers,

                totalProducts,

                totalOrders,

                totalReviews,

                totalRevenue,

            },

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: "Internal Server Error",

        });

    }

};
// MONTHLY SALES ANALYTICS
export const monthlySalesAnalytics = async (req, res) => {

    try {

        const sales = await Order.aggregate([

            {
                $match: {
                    orderStatus: "Delivered",
                },
            },

            {
                $group: {

                    _id: {
                        year: {
                            $year: "$createdAt",
                        },
                        month: {
                            $month: "$createdAt",
                        },
                    },

                    totalOrders: {
                        $sum: 1,
                    },

                    totalRevenue: {
                        $sum: "$totalPrice",
                    },

                },
            },

            {
                $sort: {
                    "_id.year": 1,
                    "_id.month": 1,
                },
            },

        ]);

        return res.status(200).json({

            success: true,

            sales,

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: "Internal Server Error",

        });

    }

};
// TOP SELLING PRODUCTS
export const topSellingProducts = async (req, res) => {

    try {

        const products = await Order.aggregate([

            {
                $match: {
                    orderStatus: "Delivered",
                },
            },

            {
                $unwind: "$orderItems",
            },

            {
                $group: {

                    _id: "$orderItems.product",

                    productName: {
                        $first: "$orderItems.name",
                    },

                    image: {
                        $first: "$orderItems.image",
                    },

                    totalSold: {
                        $sum: "$orderItems.quantity",
                    },

                    revenue: {
                        $sum: {
                            $multiply: [
                                "$orderItems.price",
                                "$orderItems.quantity"
                            ]
                        }
                    }

                }
            },

            {
                $sort: {
                    totalSold: -1,
                },
            },

            {
                $limit: 10,
            }

        ]);

        return res.status(200).json({

            success: true,

            count: products.length,

            products,

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: "Internal Server Error",

        });

    }

};
// RECENT ORDERS
export const recentOrders = async (req, res) => {

    try {

 const orders = await Order.find()

.populate("user", "fullname email")

.select(
    "totalPrice paymentMethod paymentStatus orderStatus createdAt"
)

.sort({
    createdAt: -1,
})

.limit(10);

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
// REVENUE ANALYTICS
export const revenueAnalytics = async (req, res) => {

    try {

        const deliveredOrders = await Order.find({
            orderStatus: "Delivered",
        });

        let totalRevenue = 0;
        let todayRevenue = 0;
        let monthRevenue = 0;
        let yearRevenue = 0;

        const today = new Date();

        for (const order of deliveredOrders) {

            totalRevenue += order.totalPrice;

            const orderDate = new Date(order.createdAt);

            // Today's Revenue
            if (
                orderDate.toDateString() ===
                today.toDateString()
            ) {
                todayRevenue += order.totalPrice;
            }

            // Current Month Revenue
            if (
                orderDate.getMonth() === today.getMonth() &&
                orderDate.getFullYear() === today.getFullYear()
            ) {
                monthRevenue += order.totalPrice;
            }

            // Current Year Revenue
            if (
                orderDate.getFullYear() ===
                today.getFullYear()
            ) {
                yearRevenue += order.totalPrice;
            }

        }

        return res.status(200).json({

            success: true,

            analytics: {

                totalRevenue,

                todayRevenue,

                monthRevenue,

                yearRevenue,

                deliveredOrders:
                    deliveredOrders.length,

            },

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: "Internal Server Error",

        });

    }

};
// LOW STOCK PRODUCTS
export const lowStockProducts = async (req, res) => {

    try {

        const threshold = Number(req.query.threshold) || 10;

        const products = await Product.find({

            stock: {
                $lte: threshold,
            },

        })
        .select(
            "name brand category price stock images isAvailable"
        )
        .sort({
            stock: 1,
        });

        return res.status(200).json({

            success: true,

            threshold,

            count: products.length,

            products,

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: "Internal Server Error",

        });

    }

};
// RECENT USERS
export const recentUsers = async (req, res) => {

    try {

   const users = await User.find()

.select(
    "fullname email role isVerified avatar createdAt"
)

.sort({
    createdAt: -1,
})

.limit(10);

        return res.status(200).json({

            success: true,

            count: users.length,

            users,

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: "Internal Server Error",

        });

    }

};
// ORDER STATUS ANALYTICS
export const orderStatusAnalytics = async (req, res) => {

    try {

        const statusData = await Order.aggregate([

            {
                $group: {

                    _id: "$orderStatus",

                    totalOrders: {
                        $sum: 1,
                    },

                },

            },

            {
                $sort: {
                    totalOrders: -1,
                },
            },

        ]);

        const analytics = {

            Pending: 0,

            Confirmed: 0,

            Shipped: 0,

            "Out for Delivery": 0,

            Delivered: 0,

            Cancelled: 0,

        };

        statusData.forEach((item) => {

            analytics[item._id] = item.totalOrders;

        });

        return res.status(200).json({

            success: true,

            analytics,

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: "Internal Server Error",

        });

    }

};
// CATEGORY ANALYTICS
export const categoryAnalytics = async (req, res) => {

    try {

        const categories = await Product.aggregate([

            {
                $group: {

                    _id: "$category",

                    totalProducts: {
                        $sum: 1,
                    },

                    totalStock: {
                        $sum: "$stock",
                    },

                    averagePrice: {
                        $avg: "$price",
                    },
                    inventoryValue: {
    $sum: {
        $multiply: ["$price", "$stock"]
    }
},

outOfStock: {
    $sum: {
        $cond: [
            { $eq: ["$stock", 0] },
            1,
            0
        ]
    }
},

lowStock: {
    $sum: {
        $cond: [
            { $lte: ["$stock", 10] },
            1,
            0
        ]
    }
}

                },

            },

            {
                $sort: {
                    totalProducts: -1,
                },
            },

        ]);

        return res.status(200).json({

            success: true,

            count: categories.length,

            categories,

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: "Internal Server Error",

        });

    }

};
// COMPLETE DASHBOARD
export const completeDashboard = async (req, res) => {

    try {
// OVERVIEW
const totalUsers =
            await User.countDocuments();

        const totalProducts =
            await Product.countDocuments();

        const totalOrders =
            await Order.countDocuments();

        const totalReviews =
            await Review.countDocuments();
// REVENUE
const deliveredOrders =
            await Order.find({
                orderStatus: "Delivered",
            });

        let totalRevenue = 0;

        deliveredOrders.forEach((order) => {
            totalRevenue += order.totalPrice;
        });
// MONTHLY SALES
const monthlySales =
            await Order.aggregate([

                {
                    $match: {
                        orderStatus: "Delivered",
                    },
                },

                {
                    $group: {

                        _id: {

                            year: {
                                $year: "$createdAt",
                            },

                            month: {
                                $month: "$createdAt",
                            },

                        },

                        totalOrders: {
                            $sum: 1,
                        },

                        totalRevenue: {
                            $sum: "$totalPrice",
                        },

                    },

                },

                {
                    $sort: {
                        "_id.year": 1,
                        "_id.month": 1,
                    },
                },

            ]);
// TOP PRODUCTS
const topProducts =
            await Order.aggregate([

                {
                    $match: {
                        orderStatus: "Delivered",
                    },
                },

                {
                    $unwind: "$orderItems",
                },

                {
                    $group: {

                        _id: "$orderItems.product",

                        productName: {
                            $first: "$orderItems.name",
                        },

                        image: {
                            $first: "$orderItems.image",
                        },

                        totalSold: {
                            $sum: "$orderItems.quantity",
                        },

                        revenue: {
                            $sum: {
                                $multiply: [
                                    "$orderItems.price",
                                    "$orderItems.quantity",
                                ],
                            },
                        },

                    },

                },

                {
                    $sort: {
                        totalSold: -1,
                    },
                },

                {
                    $limit: 5,
                },

            ]);
// RECENT ORDERS
const recentOrders =
            await Order.find()

                .populate(
                    "user",
                    "fullname email"
                )

                .sort({
                    createdAt: -1,
                })

                .limit(5);
// LOW STOCK
const lowStockProducts =
            await Product.find({

                stock: {
                    $lte: 10,
                },

            })

                .select(
                    "name stock images"
                )

                .sort({
                    stock: 1,
                });
// RECENT USERS
const recentUsers =
            await User.find()

                .select(
                    "-password"
                )

                .sort({
                    createdAt: -1,
                })

                .limit(5);
// ORDER STATUS
const orderStatus =
            await Order.aggregate([

                {

                    $group: {

                        _id: "$orderStatus",

                        totalOrders: {
                            $sum: 1,
                        },

                    },

                },

            ]);
// CATEGORY
const categoryAnalytics =
            await Product.aggregate([

                {

                    $group: {

                        _id: "$category",

                        totalProducts: {
                            $sum: 1,
                        },

                        totalStock: {
                            $sum: "$stock",
                        },

                    },

                },

            ]);
// RESPONSE
return res.status(200).json({

            success: true,

            overview: {

                totalUsers,

                totalProducts,

                totalOrders,

                totalReviews,

                totalRevenue,

            },

            monthlySales,

            topProducts,

            recentOrders,

            lowStockProducts,

            recentUsers,

            orderStatus,

            categoryAnalytics,

        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: "Internal Server Error",

        });

    }

};