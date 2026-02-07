import Review from "./review.model.js";
import Product from "../products/product.model.js";

const addReview = async (userId, userName, productId, rating, comment) => {
    // Check if user already reviewed
    const existing = await Review.findOne({ user: userId, product: productId });
    if (existing) {
        throw new Error("You have already reviewed this product");
    }

    const review = await Review.create({
        user: userId,
        userName,
        product: productId,
        rating,
        comment
    });

    // Update product average rating
    await updateProductRating(productId);

    return review;
};

const getReviewsByProduct = async (productId) => {
    return await Review.find({ product: productId }).sort({ createdAt: -1 });
};

const updateProductRating = async (productId) => {
    const reviews = await Review.find({ product: productId });

    if (reviews.length === 0) {
        await Product.findByIdAndUpdate(productId, {
            averageRating: 0,
            reviewCount: 0
        });
        return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    await Product.findByIdAndUpdate(productId, {
        averageRating: parseFloat(averageRating.toFixed(1)),
        reviewCount: reviews.length
    });
};

export default {
    addReview,
    getReviewsByProduct
};
