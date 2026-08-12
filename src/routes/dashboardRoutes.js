import express from "express";

import auth from "../middleware/authMiddleware.js";
import admin from "../middleware/adminMiddleware.js";

import {

    dashboardOverview,
    monthlySalesAnalytics,
    topSellingProducts,
    recentOrders,
    revenueAnalytics,
    lowStockProducts,
    recentUsers,
    orderStatusAnalytics,
    categoryAnalytics,
    completeDashboard

} from "../controller/dashboardController.js";

const router = express.Router();

router.get("/", auth, admin, completeDashboard);

router.get("/overview", auth, admin, dashboardOverview);

router.get("/monthly-sales", auth, admin, monthlySalesAnalytics);

router.get("/top-products", auth, admin, topSellingProducts);

router.get("/recent-orders", auth, admin, recentOrders);

router.get("/revenue", auth, admin, revenueAnalytics);

router.get("/low-stock", auth, admin, lowStockProducts);

router.get("/recent-users", auth, admin, recentUsers);

router.get("/order-status", auth, admin, orderStatusAnalytics);

router.get("/category-analytics", auth, admin, categoryAnalytics);
export default router;