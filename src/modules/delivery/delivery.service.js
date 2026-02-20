import Product from "../products/product.model.js";
import AppError from "../../utils/AppError.js";

/**
 * Service to handle delivery and shipping availability logic
 */
const deliveryService = {
    /**
     * Checks if a product is deliverable to a specific pincode
     * @param {string} productId 
     * @param {string} pincode 
     * @returns {Promise<{isDeliverable: boolean, message: string}>}
     */
    async checkAvailability(productId, pincode) {
        if (!pincode || pincode.length !== 6) {
            throw new AppError(400, "Invalid pincode format. Must be 6 digits.");
        }

        const product = await Product.findById(productId).select('isDeliverableEverywhere availableLocations name');
        if (!product) {
            throw new AppError(404, "Product not found");
        }

        // Logic:
        // 1. If isDeliverableEverywhere is true, it's deliverable.
        // 2. If false, check if pincode is in availableLocations array.

        if (product.isDeliverableEverywhere) {
            return {
                isDeliverable: true,
                message: `Product is available for delivery to ${pincode}`
            };
        }

        const isAvailable = product.availableLocations && product.availableLocations.includes(pincode);

        if (isAvailable) {
            return {
                isDeliverable: true,
                message: `Product is available for delivery to ${pincode}`
            };
        }

        return {
            isDeliverable: false,
            message: `Sorry, we do not deliver ${product.name} to ${pincode} yet.`
        };
    },

    /**
     * Bulk check availability for a list of items (e.g. for cart checkout)
     * @param {Array<{productId: string, quantity: number}>} items 
     * @param {string} pincode 
     */
    async validateCheckoutAvailability(items, pincode) {
        const issues = [];

        for (const item of items) {
            const availability = await this.checkAvailability(item.productId, pincode);
            if (!availability.isDeliverable) {
                issues.push({
                    productId: item.productId,
                    message: availability.message
                });
            }
        }

        return issues;
    }
};

export default deliveryService;
