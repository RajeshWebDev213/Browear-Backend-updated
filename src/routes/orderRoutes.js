import express from "express";

import auth from "../middleware/authMiddleware.js";

import {
    placeOrder,
    getMyOrders,
    getSingleOrder,
    cancelOrder,
    getAllOrders,
    updateOrderStatus,
    getOrderStats
} from "../controller/orderController.js";
import admin from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/", auth, placeOrder);

router.get("/my-orders", auth, getMyOrders);

router.get("/admin/all", auth, admin, getAllOrders);

router.get("/admin/stats", auth, admin, getOrderStats);

router.put(
    "/admin/:orderId/status",
    auth,
    admin,
    updateOrderStatus
);

router.get("/:orderId", auth, getSingleOrder);

router.put("/:orderId/cancel", auth, cancelOrder);

export default router;