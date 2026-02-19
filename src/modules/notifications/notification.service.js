import Notification from "./notification.model.js";
import User from "../users/user.model.js";
import { getIO } from "../../socket/index.js";

const createNotification = async (data) => {
    return await Notification.create(data);
};

export const sendToUser = async (userId, { type, title, message, link, metadata }) => {
    try {
        // 1. Save to DB
        const notification = await createNotification({
            recipient: userId,
            type,
            title,
            message,
            link,
            metadata
        });

        // 2. Emit via Socket
        try {
            const io = getIO();
            io.to(`user_${userId}`).emit("notification", notification);
        } catch (socketError) {
            console.error("Socket emit failed (non-fatal):", socketError.message);
        }

        return notification;
    } catch (error) {
        console.error("Error sending notification to user:", error);
    }
};

export const sendToAdmins = async ({ type, title, message, link, metadata }) => {
    try {
        // 1. Find all admins
        const admins = await User.find({ role: "ADMIN" }).select("_id");

        if (!admins.length) return;

        // 2. Create notifications for each admin
        const notificationsData = admins.map(admin => ({
            recipient: admin._id,
            type,
            title,
            message,
            link,
            metadata
        }));

        const notifications = await Notification.insertMany(notificationsData);

        // 3. Emit to Admin Room
        try {
            const io = getIO();
            // We emit a single event to the room. 
            // The frontend logic might need to distinguish if it's "my" notification or generic.
            // Simplified: Admins listening to "notification" in "admin_room" will get this.
            io.to("admin_room").emit("notification", {
                type,
                title,
                message,
                link,
                metadata,
                forRole: "ADMIN"
            });
        } catch (socketError) {
            console.error("Socket emit failed (non-fatal):", socketError.message);
        }

        return notifications;
    } catch (error) {
        console.error("Error sending notification to admins:", error);
    }
};

export const getUserNotifications = async (userId, limit = 20, skip = 0) => {
    return await Notification.find({ recipient: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
};

export const markAsRead = async (notificationId, userId) => {
    return await Notification.findOneAndUpdate(
        { _id: notificationId, recipient: userId }, // Ensure ownership
        { isRead: true },
        { new: true }
    );
};

export const markAllAsRead = async (userId) => {
    return await Notification.updateMany(
        { recipient: userId, isRead: false },
        { isRead: true }
    );
};

export default {
    sendToUser,
    sendToAdmins,
    getUserNotifications,
    markAsRead,
    markAllAsRead
};
