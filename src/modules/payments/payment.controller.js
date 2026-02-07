import * as paymentService from "./payment.service.js";

export const createRazorpayOrder = async (req, res, next) => {
    try {
        const { orderId } = req.body;
        if (!orderId) {
            return res.status(400).json({ message: "Order ID is required" });
        }
        const order = await paymentService.createRazorpayOrder(orderId);
        res.status(200).json(order);
    } catch (error) {
        next(error);
    }
};

export const verifyRazorpayPayment = async (req, res, next) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderId
        } = req.body;

        const result = await paymentService.verifyRazorpayPayment(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderId
        );

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const getAllPayments = async (req, res, next) => {
    try {
        const result = await paymentService.getAllPayments(req.query);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};
