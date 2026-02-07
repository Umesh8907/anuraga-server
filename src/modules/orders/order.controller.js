import * as orderService from "./order.service.js";

export const createOrder = async (req, res, next) => {
    try {
        const order = await orderService.createOrder(req.user._id, req.body);
        res.status(201).json({ success: true, data: order });
    } catch (error) {
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
        res.json({ success: true, data: order });
    } catch (error) {
        next(error);
    }
};
