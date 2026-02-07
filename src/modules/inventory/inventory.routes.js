import { Router } from "express";
import { getHistory, adjustStock } from "./inventory.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import adminMiddleware from "../../middlewares/admin.middleware.js";

const router = Router();

/**
 * @openapi
 * /inventory/history:
 *   get:
 *     tags:
 *       - Inventory
 *     description: Get inventory transaction history
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: productId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of transactions
 */
router.get("/history", authMiddleware, adminMiddleware, getHistory);

/**
 * @openapi
 * /inventory/adjust:
 *   post:
 *     tags:
 *       - Inventory
 *     description: Manually adjust stock
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - variantId
 *               - type
 *               - quantity
 *               - reason
 *             properties:
 *               productId:
 *                 type: string
 *               variantId:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [IN, OUT, ADJUSTMENT]
 *               quantity:
 *                 type: number
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Stock adjusted
 */
router.post("/adjust", authMiddleware, adminMiddleware, adjustStock);

export default router;
