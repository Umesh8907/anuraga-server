import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true // Can be a specific user ID. logic will handle 'admin' broadcasting by creating individual notifs or using valid admin IDs.
        },
        type: {
            type: String,
            enum: ['ORDER', 'SYSTEM', 'INVENTORY', 'PROMO'],
            required: true
        },
        title: {
            type: String,
            required: true
        },
        message: {
            type: String,
            required: true
        },
        link: {
            type: String // e.g., "/orders/12345"
        },
        isRead: {
            type: Boolean,
            default: false
        },
        metadata: {
            type: Object // Flexible payload for frontend (e.g., { orderId: "..." })
        }
    },
    { timestamps: true }
);

// Index for fetching user's notifications quickly
notificationSchema.index({ recipient: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
