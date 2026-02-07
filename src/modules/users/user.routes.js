import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import {
    getProfile,
    addAddress,
    updateAddress,
    deleteAddress
} from "./user.controller.js";

const router = Router();

router.use(authMiddleware);

/* ---------- Profile ---------- */

/**
 * @openapi
 * /users/me:
 *   get:
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     description: Get current user profile
 *     responses:
 *       200:
 *         description: User profile
 */
router.get("/me", getProfile);

/* ---------- Address Management ---------- */

/**
 * @openapi
 * /users/addresses:
 *   post:
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     description: Add a new address
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - addressLine1
 *               - city
 *               - state
 *               - pincode
 *             properties:
 *               addressLine1:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               pincode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Address added
 */
router.post("/addresses", addAddress);

/**
 * @openapi
 * /users/addresses/{addressId}:
 *   put:
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     description: Update an address
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               addressLine1:
 *                 type: string
 *               city:
 *                 type: string
 *     responses:
 *       200:
 *         description: Address updated
 *   delete:
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     description: Delete an address
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Address deleted
 */
router.put("/addresses/:addressId", updateAddress);
router.delete("/addresses/:addressId", deleteAddress);

export default router;
