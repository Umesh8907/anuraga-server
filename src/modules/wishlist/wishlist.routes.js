import { Router } from "express";
import wishlistController from "./wishlist.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

/**
 * @openapi
 * /wishlist:
 *   get:
 *     tags:
 *       - Wishlist
 *     security:
 *       - bearerAuth: []
 *     description: Get user's wishlist
 *     responses:
 *       200:
 *         description: Wishlist details
 */
router.get("/", wishlistController.getWishlist);

/**
 * @openapi
 * /wishlist:
 *   post:
 *     tags:
 *       - Wishlist
 *     security:
 *       - bearerAuth: []
 *     description: Add product to wishlist
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *             properties:
 *               productId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product added to wishlist
 */
router.post("/", wishlistController.addToWishlist);

/**
 * @openapi
 * /wishlist/{productId}:
 *   delete:
 *     tags:
 *       - Wishlist
 *     security:
 *       - bearerAuth: []
 *     description: Remove product from wishlist
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product removed from wishlist
 */
router.delete("/:productId", wishlistController.removeFromWishlist);

export default router;
