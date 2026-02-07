import { Router } from "express";
import reviewController from "./review.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";

const router = Router();

/**
 * @openapi
 * /reviews/{productId}:
 *   get:
 *     tags:
 *       - Reviews
 *     description: Get reviews for a product
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of reviews
 */
router.get("/:productId", reviewController.getReviewsByProduct);

/**
 * @openapi
 * /reviews/{productId}:
 *   post:
 *     tags:
 *       - Reviews
 *     security:
 *       - bearerAuth: []
 *     description: Add review for a product
 *     parameters:
 *       - in: path
 *         name: productId
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
 *               - rating
 *               - comment
 *             properties:
 *               rating:
 *                 type: number
 *                 min: 1
 *                 max: 5
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review added
 *       400:
 *         description: Validation error or duplicate review
 */
router.post("/:productId", authMiddleware, reviewController.addReview);

export default router;
