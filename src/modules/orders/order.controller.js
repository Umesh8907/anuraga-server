import * as orderService from "./order.service.js";

export const createOrder = async (req, res, next) => {
    try {
        const order = await orderService.createOrder(req.user._id, req.body);
        res.status(201).json(order);
    } catch (error) {
        next(error);
    }
};

export const getMyOrders = async (req, res, next) => {
    try {
        const orders = await orderService.getOrdersByUser(req.user._id);
        res.json(orders);
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
        res.json(order);
    } catch (error) {
        next(error);
    }
};

export const getAllOrders = async (req, res, next) => {
    try {
        const result = await orderService.getAllOrders(req.query);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const updateOrderStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const order = await orderService.updateOrderStatus(id, status);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        res.json(order);
    } catch (error) {
        next(error);
    }
};
