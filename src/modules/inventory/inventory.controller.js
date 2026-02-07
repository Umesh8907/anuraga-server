import inventoryService from "./inventory.service.js";

export const getHistory = async (req, res, next) => {
    try {
        const result = await inventoryService.getHistory(req.query);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

export const adjustStock = async (req, res, next) => {
    try {
        const { productId, variantId, quantity, type, reason } = req.body;
        // userId from auth middleware
        const userId = req.user.id;

        if (!productId || !variantId || !type || !reason) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }

        const result = await inventoryService.adjustStock({
            productId,
            variantId,
            quantity,
            type,
            reason,
            userId
        });

        res.status(200).json({
            success: true,
            message: "Stock adjusted successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};
