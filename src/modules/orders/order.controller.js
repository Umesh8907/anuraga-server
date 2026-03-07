import * as orderService from "./order.service.js";
import * as invoiceService from "./invoice.service.js";
import * as notificationService from "../notifications/notification.service.js";

export const createOrder = async (req, res, next) => {
    try {
        console.log("DEBUG: Controller createOrder - req.user:", req.user);
        console.log("DEBUG: Controller createOrder - req.body:", req.body);
        const order = await orderService.createOrder(req.user.id, req.body);

        // Notify Admins
        notificationService.sendToAdmins({
            type: 'ORDER',
            title: 'New Order Received',
            message: `Order #${order._id} received from ${req.user.name || 'Customer'}`,
            link: `/admin/orders/${order._id}`,
            metadata: { orderId: order._id }
        });

        res.status(201).json({ success: true, data: order });
    } catch (error) {
        console.error("ORDER CREATION ERROR:", error);
        next(error);
    }
};

export const getMyOrders = async (req, res, next) => {
    try {
        const orders = await orderService.getOrdersByUser(req.user._id);
        res.json({ success: true, data: orders });
    } catch (error) {
        next(error);
    }
};

export const getOrderById = async (req, res, next) => {
    try {
        const order = await orderService.getOrderById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        // Ensure user owns the order or is admin (if role based access control exists)
        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }
        res.json({ success: true, data: order });
    } catch (error) {
        next(error);
    }
};

export const getAllOrders = async (req, res, next) => {
    try {
        const result = await orderService.getAllOrders(req.query);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const updateOrderStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, note } = req.body; // Allow optional note
        const order = await orderService.updateOrderStatus(id, status, note);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Notify User
        // Ensure we have a user ID. If order.user is an object (populated), use ._id
        const userId = order.user._id || order.user;
        notificationService.sendToUser(userId, {
            type: 'ORDER',
            title: 'Order Status Updated',
            message: `Your order #${order._id} is now ${status}`,
            link: `/account/orders/${order._id}`,
            metadata: { orderId: order._id, status }
        });

        res.json({ success: true, data: order });
    } catch (error) {
        next(error);
    }
};

export const cancelOrder = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        // Security: Ensure user owns the order
        const existingOrder = await orderService.getOrderById(id);
        if (!existingOrder) return res.status(404).json({ message: "Order not found" });

        // Assuming req.user is populated by auth middleware
        if (existingOrder.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        const order = await orderService.cancelOrder(id, reason);
        res.json({ success: true, data: order });
    } catch (error) {
        next(error);
    }
};

export const getInvoice = async (req, res, next) => {
    try {
        const { id } = req.params;
        const invoiceData = await invoiceService.getInvoiceData(id);

        // Security: Ensure user owns the order OR is admin
        // req.user from authMiddleware, assuming it has id/role
        const order = await orderService.getOrderById(id);
        if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Not authorized" });
        }

        res.json({ success: true, data: invoiceData });
    } catch (error) {
        next(error);
    }
};
