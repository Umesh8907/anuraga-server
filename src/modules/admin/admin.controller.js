import * as adminService from "./admin.service.js";

export const getDashboardStats = async (req, res, next) => {
    try {
        const stats = await adminService.getDashboardStats();
        res.json(stats);
    } catch (error) {
        next(error);
    }
};
