import { Router } from "express";
import {
    createOrder,
    getMyOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    cancelOrder
} from "./order.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import adminMiddleware from "../../middlewares/admin.middleware.js";

const router = Router();

router.use(authMiddleware);

/**
 * @openapi
 * /orders:
 *   post:
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     description: Create a new order
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shippingAddress
 *             properties:
 *               shippingAddress:
 *                 type: object
 *               paymentMethod:
 *                 type: string
 *                 enum: [COD, ONLINE]
 *     responses:
 *       201:
 *         description: Order created
 *   get:
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     description: Get my orders
 *     responses:
 *       200:
 *         description: List of orders
 */
router.post("/", createOrder);
router.get("/", getMyOrders);

/**
 * @openapi
 * /orders/admin/all:
 *   get:
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     description: Get all orders (Admin)
 *     responses:
 *       200:
 *         description: List of all orders
 */
router.get("/admin/all", adminMiddleware, getAllOrders);

/**
 * @openapi
 * /orders/{id}:
 *   get:
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     description: Get order details
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details
 *       404:
 *         description: Order not found
 */
router.get("/:id", getOrderById);

/**
 * @openapi
 * /orders/{id}/status:
 *   patch:
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     description: Update order status (Admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch("/:id/status", adminMiddleware, updateOrderStatus);

/**
 * @openapi
 * /orders/{id}/cancel:
 *   post:
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     description: Cancel an order and restore stock
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order cancelled
 */
router.post("/:id/cancel", cancelOrder);

export default router;
