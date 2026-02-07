import { Router } from "express";
import {
    getCart,
    addItemToCart,
    updateCartItem,
    removeCartItem
} from "./cart.controller.js";

import authMiddleware from "../../middlewares/auth.middleware.js";

const router = Router();

// 🔐 Protect all cart routes
router.use(authMiddleware);

/**
 * @openapi
 * /cart:
 *   get:
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     description: Get user cart
 *     responses:
 *       200:
 *         description: User cart
 *   post:
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     description: Add item to cart
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *               variantId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Item added to cart
 */
router.get("/", getCart);
router.post("/", addItemToCart);

/**
 * @openapi
 * /cart/{cartItemId}:
 *   put:
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     description: Update cart item quantity
 *     parameters:
 *       - in: path
 *         name: cartItemId
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
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Cart item updated
 *   delete:
 *     tags:
 *       - Cart
 *     security:
 *       - bearerAuth: []
 *     description: Remove item from cart
 *     parameters:
 *       - in: path
 *         name: cartItemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item removed
 */
router.put("/:cartItemId", updateCartItem);
router.delete("/:cartItemId", removeCartItem);

export default router;
