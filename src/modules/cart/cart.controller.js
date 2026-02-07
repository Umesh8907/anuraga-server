import cartService from "./cart.service.js";

export const getCart = async (req, res, next) => {
    try {
        const cart = await cartService.getCartByUser(req.user.id);
        res.status(200).json({ success: true, data: cart });
    } catch (error) {
        next(error);
    }
};

export const addItemToCart = async (req, res, next) => {
    try {
        const { productId, variantId, quantity } = req.body;

        const cart = await cartService.addToCart({
            userId: req.user.id,
            productId,
            variantId,
            quantity
        });

        res.status(200).json({ success: true, data: cart });
    } catch (error) {
        next(error);
    }
};

export const updateCartItem = async (req, res, next) => {
    try {
        const { cartItemId } = req.params;
        const { quantity } = req.body;

        const cart = await cartService.updateCartItem({
            userId: req.user.id,
            cartItemId,
            quantity
        });

        res.status(200).json({ success: true, data: cart });
    } catch (error) {
        next(error);
    }
};

export const removeCartItem = async (req, res, next) => {
    try {
        const { cartItemId } = req.params;

        const cart = await cartService.removeCartItem({
            userId: req.user.id,
            cartItemId
        });

        res.status(200).json({ success: true, data: cart });
    } catch (error) {
        next(error);
    }
};

export const syncCart = async (req, res, next) => {
    try {
        const { items } = req.body;
        const cart = await cartService.syncCart(req.user.id, items);
        res.status(200).json({ success: true, data: cart });
    } catch (error) {
        next(error);
    }
};
