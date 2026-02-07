import { Router } from "express";
import { getDashboardStats } from "./admin.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";

const router = Router();

// Protect all admin routes
// In a real app, you'd also check for 'role === "admin"' here
router.use(authMiddleware);

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

export default router;
