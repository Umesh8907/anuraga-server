import Wishlist from "./wishlist.model.js";

const getWishlist = async (userId) => {
    let wishlist = await Wishlist.findOne({ user: userId }).populate(
        "products",
        "name variants images slug"
    );

    if (!wishlist) {
        wishlist = await Wishlist.create({ user: userId, products: [] });
    }

    return wishlist;
};

const addToWishlist = async (userId, productId) => {
    let wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
        wishlist = await Wishlist.create({ user: userId, products: [productId] });
    } else {
        if (!wishlist.products.includes(productId)) {
            wishlist.products.push(productId);
            await wishlist.save();
        }
    }

    return wishlist;
};

const removeFromWishlist = async (userId, productId) => {
    const wishlist = await Wishlist.findOne({ user: userId });

    if (wishlist) {
        wishlist.products = wishlist.products.filter(
            (p) => p.toString() !== productId
        );
        await wishlist.save();
    }

    return wishlist;
};

export default {
    getWishlist,
    addToWishlist,
    removeFromWishlist
};
