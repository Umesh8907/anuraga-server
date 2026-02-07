import User from "../modules/users/user.model.js";
import AppError from "../utils/AppError.js";

const adminMiddleware = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            throw new AppError(401, "Not authenticated");
        }

        const user = await User.findById(req.user.id);

        if (!user || user.role !== "ADMIN") {
            throw new AppError(403, "Access denied. Admin resources only.");
        }

        next();
    } catch (error) {
        next(error);
    }
};

export default adminMiddleware;
