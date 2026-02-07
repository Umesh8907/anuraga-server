import Cart from "./cart.model.js";
import Product from "../products/product.model.js";

const getCartByUser = async (userId) => {
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
        cart = await Cart.create({ user: userId, items: [] });
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
        i =>
            i.product.toString() === productId &&
            i.variantId.toString() === variantId
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
    return cart;
};

const updateCartItem = async ({ userId, cartItemId, quantity }) => {
    const cart = await getCartByUser(userId);
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
    return cart;
};

const removeCartItem = async ({ userId, cartItemId }) => {
    const cart = await getCartByUser(userId);
    const item = cart.items.id(cartItemId);

    if (!item) throw new Error("Cart item not found");

    item.remove();
    await cart.save();
    return cart;
};

const clearCart = async (userId) => {
    const cart = await getCartByUser(userId);
    cart.items = [];
    await cart.save();
    return cart;
};

export default {
    getCartByUser,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart
};
