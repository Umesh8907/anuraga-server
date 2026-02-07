import * as adminService from "./admin.service.js";

export const getDashboardStats = async (req, res, next) => {
    try {
        const stats = await adminService.getDashboardStats();
        res.json(stats);
    } catch (error) {
        next(error);
    }
};

export const getUsers = async (req, res, next) => {
    try {
        const result = await adminService.getUsers(req.query);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const updateUserStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const user = await adminService.updateUserStatus(id, status);
        res.json(user);
    } catch (error) {
        next(error);
    }
};
