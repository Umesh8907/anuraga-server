import wishlistService from "./wishlist.service.js";

const getWishlist = async (req, res, next) => {
    try {
        const wishlist = await wishlistService.getWishlist(req.user.id);
        res.status(200).json({ success: true, data: wishlist });
    } catch (error) {
        next(error);
    }
};

const addToWishlist = async (req, res, next) => {
    try {
        const { productId } = req.body;
        const wishlist = await wishlistService.addToWishlist(
            req.user.id,
            productId
        );
        res.status(200).json({ success: true, data: wishlist });
    } catch (error) {
        next(error);
    }
};

const removeFromWishlist = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const wishlist = await wishlistService.removeFromWishlist(
            req.user.id,
            productId
        );
        res.status(200).json({ success: true, data: wishlist });
    } catch (error) {
        next(error);
    }
};

export default {
    getWishlist,
    addToWishlist,
    removeFromWishlist
};
