import { Router } from "express";
import {
    getDashboardStats,
    getUsers,
    updateUserStatus
} from "./admin.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import adminMiddleware from "../../middlewares/admin.middleware.js";

const router = Router();

// Protect all admin routes
router.use(authMiddleware);
router.use(adminMiddleware);

/**
 * @openapi
 * /admin/stats:
 *   get:
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     description: Get dashboard statistics (admin only)
 *     responses:
 *       200:
 *         description: Dashboard statistics
 */
router.get("/stats", getDashboardStats);

/**
 * @openapi
 * /admin/users:
 *   get:
 *     tags: [Admin]
 *     description: Get all users with pagination and search
 */
router.get("/users", getUsers);

/**
 * @openapi
 * /admin/users/{id}/status:
 *   patch:
 *     tags: [Admin]
 *     description: Block or unblock a user
 */
router.patch("/users/:id/status", updateUserStatus);

export default router;
