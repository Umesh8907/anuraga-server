import { Router } from "express";
import collectionRoutes from "./modules/collections/collection.routes.js";
import productRoutes from "./modules/products/product.routes.js";
import cartRoutes from "./modules/cart/cart.routes.js";
import userRoutes from "./modules/users/user.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import orderRoutes from "./modules/orders/order.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import paymentRoutes from "./modules/payments/payment.routes.js";
import wishlistRoutes from "./modules/wishlist/wishlist.routes.js";
import reviewRoutes from "./modules/reviews/review.routes.js";
import inventoryRoutes from "./modules/inventory/inventory.routes.js";
const router = Router();

router.use("/collections", collectionRoutes);
router.use("/products", productRoutes);
router.use("/cart", cartRoutes);
router.use("/auth", authRoutes);


router.use("/users", userRoutes);
router.use("/orders", orderRoutes);
router.use("/admin", adminRoutes);
router.use("/payments", paymentRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/reviews", reviewRoutes);
router.use("/inventory", inventoryRoutes);

router.get("/health", (req, res) => {
    res.json({ api: "running" });
});

export default router;
