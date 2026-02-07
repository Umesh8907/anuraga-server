import Cart from "./cart.model.js";
import Product from "../products/product.model.js";

const getCartByUser = async (userId) => {
    console.log("DEBUG: CartService getCartByUser - userId:", userId);
    let cart = await Cart.findOne({ user: userId }).populate('items.product');

    if (!cart) {
        cart = await Cart.create({ user: userId, items: [] });
        // No need to populate empty array
    }

    return cart;
};

const addToCart = async ({ userId, productId, variantId, quantity }) => {
    const product = await Product.findById(productId);
    if (!product) throw new Error("Product not found");

    const variant = product.variants.find(
        v => v._id.toString() === variantId
    );

    if (!variant) throw new Error("Invalid variant");

    if (variant.stock < quantity) {
        throw new Error(`Insufficient stock. Only ${variant.stock} available.`);
    }

    if (product.isCombo && quantity !== 1) {
        throw new Error("Combo product quantity must be 1");
    }

    const cart = await getCartByUser(userId);

    const existing = cart.items.find(
        i => {
            const pId = i.product._id?.toString() || i.product.toString();
            const vId = i.variantId.toString();
            return pId === productId && vId === variantId;
        }
    );

    if (existing) {
        if (existing.quantity + quantity > variant.stock) {
            throw new Error(`Insufficient stock. Only ${variant.stock} available.`);
        }
        existing.quantity += quantity;
    } else {
        cart.items.push({
            product: product._id,
            variantId: variant._id,
            variantLabel: variant.label,
            price: variant.price,
            quantity
        });
    }

    await cart.save();
    return Cart.findById(cart._id).populate('items.product');
};

const updateCartItem = async ({ userId, cartItemId, quantity }) => {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) throw new Error("Cart not found");

    const item = cart.items.id(cartItemId);
    if (!item) throw new Error("Cart item not found");

    if (quantity < 1) throw new Error("Quantity must be at least 1");

    // Check stock availability
    const product = await Product.findById(item.product);
    if (!product) throw new Error("Product not found");

    const variant = product.variants.find(
        v => v._id.toString() === item.variantId.toString()
    );
    if (!variant) throw new Error("Variant not found");

    if (quantity > variant.stock) {
        throw new Error(`Insufficient stock. Only ${variant.stock} available.`);
    }

    item.quantity = quantity;
    await cart.save();
    return Cart.findById(cart._id).populate('items.product');
};

const removeCartItem = async ({ userId, cartItemId }) => {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) throw new Error("Cart not found");

    const item = cart.items.id(cartItemId);
    if (!item) throw new Error("Cart item not found");

    cart.items.pull(cartItemId);
    await cart.save();
    return Cart.findById(cart._id).populate('items.product');
};

const clearCart = async (userId) => {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return null;
    cart.items = [];
    await cart.save();
    return cart;
};

const syncCart = async (userId, items) => {
    const cart = await getCartByUser(userId);

    for (const item of items) {
        try {
            const product = await Product.findById(item.productId);
            if (!product) continue;

            const variant = product.variants.find(
                v => v._id.toString() === item.variantId.toString()
            );
            if (!variant) continue;

            const existing = cart.items.find(
                i => i.product.toString() === item.productId && i.variantId.toString() === item.variantId
            );

            if (existing) {
                // Keep the larger quantity or sum them?
                // Summing is usually better for UX
                existing.quantity = Math.min(existing.quantity + item.quantity, variant.stock);
            } else {
                cart.items.push({
                    product: product._id,
                    variantId: variant._id,
                    variantLabel: variant.label,
                    price: variant.price,
                    quantity: Math.min(item.quantity, variant.stock)
                });
            }
        } catch (err) {
            console.error(`Sync error for product ${item.productId}:`, err);
        }
    }

    await cart.save();
    return Cart.findById(cart._id).populate('items.product');
};

export default {
    getCartByUser,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    syncCart
};
