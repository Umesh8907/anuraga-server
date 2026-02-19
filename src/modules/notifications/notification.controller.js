import * as notificationService from "./notification.service.js";

export const getMyNotifications = async (req, res, next) => {
    try {
        const { limit, skip } = req.query;
        const notifications = await notificationService.getUserNotifications(
            req.user._id,
            limit ? parseInt(limit) : 20,
            skip ? parseInt(skip) : 0
        );
        res.json({ success: true, data: notifications });
    } catch (error) {
        next(error);
    }
};

export const markAsRead = async (req, res, next) => {
    try {
        const { id } = req.params;
        const notification = await notificationService.markAsRead(id, req.user._id);
        res.json({ success: true, data: notification });
    } catch (error) {
        next(error);
    }
};

export const markAllAsRead = async (req, res, next) => {
    try {
        await notificationService.markAllAsRead(req.user._id);
        res.json({ success: true, message: "All marked as read" });
    } catch (error) {
        next(error);
    }
};
