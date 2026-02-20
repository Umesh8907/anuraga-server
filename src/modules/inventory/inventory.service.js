import InventoryTransaction from "./inventory.model.js";
import Product from "../products/product.model.js";
import * as notificationService from "../notifications/notification.service.js";

export const logTransaction = async (data) => {
    const transaction = new InventoryTransaction(data);
    return await transaction.save();
};

export const getHistory = async (query = {}) => {
    const { page = 1, limit = 20, productId, type } = query;
    const filter = {};

    if (productId) filter.product = productId;
    if (type) filter.type = type;

    const transactions = await InventoryTransaction.find(filter)
        .populate("product", "name")
        .populate("performedBy", "name email")
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const count = await InventoryTransaction.countDocuments(filter);

    return {
        transactions,
        totalPages: Math.ceil(count / limit),
        currentPage: Number(page)
    };
};

export const adjustStock = async ({ productId, variantId, quantity, type, reason, userId }) => {
    const product = await Product.findById(productId);
    if (!product) throw new Error("Product not found");

    const variant = product.variants.id(variantId);
    if (!variant) throw new Error("Variant not found");

    const previousStock = variant.stock;
    let delta = 0;

    if (type === "IN") {
        delta = Math.abs(quantity);
    } else if (type === "OUT") {
        delta = -Math.abs(quantity);
    } else if (type === "ADJUSTMENT") {
        delta = quantity; // Using signed quantity for adjustments
    }

    // Update stocks
    variant.stock += delta;
    variant.realStock = (variant.realStock || 0) + delta;
    variant.inStock = (variant.inStock || 0) + delta;

    // Safety check: Stock cannot be negative in most scenarios
    if (variant.stock < 0) variant.stock = 0;
    if (variant.realStock < 0) variant.realStock = 0;
    if (variant.inStock < 0) variant.inStock = 0;

    await product.save();

    // Check for Low Stock
    if (variant.stock < 10) {
        notificationService.sendToAdmins({
            type: 'INVENTORY',
            title: 'Low Stock Alert',
            message: `Product "${product.name} - ${variant.label}" is running low (${variant.stock} left).`,
            link: `/admin/inventory?search=${product.name}`,
            metadata: { productId: product._id, variantId: variant._id, currentStock: variant.stock }
        });
    }

    // Log Transaction
    await logTransaction({
        product: productId,
        variantId,
        variantLabel: variant.label,
        type,
        quantity: Math.abs(delta),
        previousStock,
        currentStock: variant.stock,
        reason,
        performedBy: userId
    });

    return { success: true, currentStock: variant.stock };
};

export default {
    logTransaction,
    getHistory,
    adjustStock
};
