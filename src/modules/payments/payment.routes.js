import { Router } from "express";
import {
    createRazorpayOrder,
    verifyRazorpayPayment,
    getAllPayments
} from "./payment.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

/**
 * @openapi
 * /payments:
 *   get:
 *     tags:
 *       - Payments
 *     security:
 *       - bearerAuth: []
 *     description: Get all successful payments (Paid Orders)
 *     responses:
 *       200:
 *         description: List of payments
 */
router.get("/", getAllPayments);

/**
 * @openapi
 * /payments/razorpay/create-order:
 *   post:
 *     tags:
 *       - Payments
 *     security:
 *       - bearerAuth: []
 *     description: Create a Razorpay order for an existing system order
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *             properties:
 *               orderId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Razorpay order created
 *       400:
 *         description: Bad request
 */
router.post("/razorpay/create-order", createRazorpayOrder);

/**
 * @openapi
 * /payments/razorpay/verify:
 *   post:
 *     tags:
 *       - Payments
 *     security:
 *       - bearerAuth: []
 *     description: Verify Razorpay payment signature
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - razorpay_order_id
 *               - razorpay_payment_id
 *               - razorpay_signature
 *               - orderId
 *             properties:
 *               razorpay_order_id:
 *                 type: string
 *               razorpay_payment_id:
 *                 type: string
 *               razorpay_signature:
 *                 type: string
 *               orderId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment verified
 *       400:
 *         description: Invalid signature
 */
router.post("/razorpay/verify", verifyRazorpayPayment);

export default router;
