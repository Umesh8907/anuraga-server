import { Router } from "express";
import {
    getCollections,
    getCollectionBySlug,
    createCollection,
    updateCollection,
    deleteCollection
} from "./collection.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";

const router = Router();

// GET /api/collections
/**
 * @openapi
 * /collections:
 *   get:
 *     tags:
 *       - Collections
 *     description: Get all collections
 *     responses:
 *       200:
 *         description: List of collections
 */
router.get("/", getCollections);

/**
 * @openapi
 * /collections/{slug}:
 *   get:
 *     tags:
 *       - Collections
 *     description: Get collection by slug
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Collection details
 *       404:
 *         description: Collection not found
 */
router.get("/:slug", getCollectionBySlug);

/**
 * @openapi
 * /collections:
 *   post:
 *     tags:
 *       - Collections
 *     security:
 *       - bearerAuth: []
 *     description: Create a new collection (Admin)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *     responses:
 *       201:
 *         description: Collection created
 */
router.post("/", authMiddleware, createCollection);

/**
 * @openapi
 * /collections/{id}:
 *   put:
 *     tags:
 *       - Collections
 *     security:
 *       - bearerAuth: []
 *     description: Update a collection (Admin)
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
 *         description: Collection updated
 */
router.put("/:id", authMiddleware, updateCollection);

/**
 * @openapi
 * /collections/{id}:
 *   delete:
 *     tags:
 *       - Collections
 *     security:
 *       - bearerAuth: []
 *     description: Delete a collection (Admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Collection deleted
 */
router.delete("/:id", authMiddleware, deleteCollection);

export default router;
