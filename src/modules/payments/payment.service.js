import Razorpay from "razorpay";
import crypto from "crypto";
import env from "../../config/env.js";
import Order from "../orders/order.model.js";

let razorpay;

if (env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
        key_id: env.RAZORPAY_KEY_ID,
        key_secret: env.RAZORPAY_KEY_SECRET
    });
} else {
    console.warn("⚠️ Razorpay keys are missing. Online payments will fail.");
}

export const createRazorpayOrder = async (orderId) => {
    if (!razorpay) {
        throw new Error("Razorpay is not configured");
    }
    const order = await Order.findById(orderId);
    if (!order) {
        throw new Error("Order not found");
    }

    const options = {
        amount: Math.round(order.totalAmount * 100), // amount in paisa
        currency: "INR",
        receipt: `receipt_order_${orderId}`
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Save the razorpay order id to the order document if needed, or just return it
    // For now, we return it to the client
    return {
        ...razorpayOrder,
        orderId: order._id // internal order id
    };
};

export const verifyRazorpayPayment = async (
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    orderId
) => {
    const body = razorpayOrderId + "|" + razorpayPaymentId;

    const expectedSignature = crypto
        .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

    const isAuthentic = expectedSignature === razorpaySignature;

    if (isAuthentic) {
        // Update order status to PAID
        const order = await Order.findByIdAndUpdate(
            orderId,
            {
                paymentStatus: "PAID",
                paymentMethod: "ONLINE",
                transactionId: razorpayPaymentId
            },
            { new: true }
        );
        return { success: true, message: "Payment verified", order };
    } else {
        throw new Error("Invalid payment signature");
    }
};

export const getAllPayments = async (query = {}) => {
    const { page = 1, limit = 10 } = query;

    const filter = { paymentStatus: "PAID" };

    const payments = await Order.find(filter)
        .select("_id transactionId totalAmount paymentMethod user createdAt")
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const count = await Order.countDocuments(filter);

    return {
        payments,
        totalPages: Math.ceil(count / limit),
        currentPage: page
    };
};
