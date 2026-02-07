import InventoryTransaction from "./inventory.model.js";
import Product from "../products/product.model.js";

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
    let currentStock = previousStock;

    if (type === "IN") {
        currentStock += quantity;
    } else if (type === "OUT") {
        currentStock -= quantity;
    } else if (type === "ADJUSTMENT") {
        // For adjustment, quantity is the NEW absolute stock or relative change?
        // Let's assume quantity passed is the CHANGE amount for simplicity in this function,
        // unless type implies "SET". 
        // To be safe and consistent with "IN/OUT", let's assume 'quantity' is always a positive number 
        // representing the MAGNITUDE of change, and type determines direction.
        // However, "ADJUSTMENT" often implies setting to a specific value or correcting.
        // Let's stick to: Inputs are always positive delta.
        // If the user wants to "Set" stock, the controller should calculate the delta.
        // Wait, for standard adjustments (damage, found stock), it's usually + or -.
        // Let's support signed quantity for ADJUSTMENT if needed, or handle in controller.

        // Revised approach: 
        // IN: stock + quantity
        // OUT: stock - quantity
        // ADJUSTMENT: could be + or -. Let's assume the caller handles the logic or we use signed quantity.
        // Let's stick to specific Types for clarity.

        if (quantity > 0) currentStock += quantity;
        else currentStock += quantity; // handle negative adjustments
    }

    // Update Product Stock
    variant.stock = currentStock;
    await product.save();

    // Log Transaction
    await logTransaction({
        product: productId,
        variantId,
        variantLabel: variant.label,
        type,
        quantity: Math.abs(quantity),
        previousStock,
        currentStock,
        reason,
        performedBy: userId
    });

    return { success: true, currentStock };
};

export default {
    logTransaction,
    getHistory,
    adjustStock
};
