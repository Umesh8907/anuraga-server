import reviewService from "./review.service.js";

const addReview = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const { rating, comment } = req.body;

        const review = await reviewService.addReview(
            req.user.id,
            req.user.name || "Anonymous", // Fallback if name not set
            productId,
            rating,
            comment
        );
        res.status(201).json({ success: true, data: review });
    } catch (error) {
        next(error);
    }
};

const getReviewsByProduct = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const reviews = await reviewService.getReviewsByProduct(productId);
        res.status(200).json({ success: true, data: reviews });
    } catch (error) {
        next(error);
    }
};

export default {
    addReview,
    getReviewsByProduct
};
