import { Router } from "express";
import {
    getProductBySlug,
    getProductsByCollectionSlug,
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts
} from "./product.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";

const router = Router();

/**
 * @openapi
 * /products:
 *   get:
 *     tags:
 *       - Products
 *     description: Get all products
 *     responses:
 *       200:
 *         description: List of products
 */
router.get("/", getAllProducts);

/**
 * @openapi
/**
 * @openapi
 * /products/search:
 *   get:
 *     tags:
 *       - Products
 *     description: Search products by name or description
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Search results
 *       400:
 *         description: Missing query parameter
 */
router.get("/search", searchProducts);

/**
 * @openapi
 * /products/{slug}:
 *   get:
 *     tags:
 *       - Products
 *     description: Get product by slug
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product details
 *       404:
 *         description: Product not found
 */
router.get("/:slug", getProductBySlug);

/**
 * @openapi
 * /products/by-collection/{slug}:
 *   get:
 *     tags:
 *       - Products
 *     description: Get products by collection slug
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of products in collection
 *       404:
 *         description: Collection not found
 */
router.get("/by-collection/:slug", getProductsByCollectionSlug);

/**
 * @openapi
 * /products:
 *   post:
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     description: Create a new product (Admin)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               stock:
 *                 type: number
 *     responses:
 *       201:
 *         description: Product created
 */
router.post("/", authMiddleware, createProduct);

/**
 * @openapi
 * /products/{id}:
 *   put:
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     description: Update a product (Admin)
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
 *     responses:
 *       200:
 *         description: Product updated
 *       404:
 *         description: Product not found
 */
router.put("/:id", authMiddleware, updateProduct);

/**
 * @openapi
 * /products/{id}:
 *   delete:
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     description: Delete a product (Admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted
 *       404:
 *         description: Product not found
 */
router.delete("/:id", authMiddleware, deleteProduct);

export default router;
