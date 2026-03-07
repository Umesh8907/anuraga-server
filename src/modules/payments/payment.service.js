import Razorpay from "razorpay";
import crypto from "crypto";
import env from "../../config/env.js";
import Order from "../orders/order.model.js";
import User from "../users/user.model.js";
import * as orderService from "../orders/order.service.js";
import * as smsService from "../notifications/sms.service.js";
import * as emailService from "../notifications/email.service.js";
import Payment from "./payment.model.js";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";

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
        receipt: `receipt_order_${orderId}`,
        payment_capture: 1 // Auto-capture payment on success
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Create a Payment record for tracking
    await Payment.create({
        orderId: order._id,
        razorpayOrderId: razorpayOrder.id,
        amount: order.totalAmount,
        currency: "INR",
        status: "CREATED",
        method: "RAZORPAY",
        rawResponse: razorpayOrder
    });

    return {
        ...razorpayOrder,
        orderId: order._id,
        key: env.RAZORPAY_KEY_ID // Send key to frontend
    };
};

export const verifyRazorpayPayment = async (
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    orderId
) => {
    // Idempotency Check: If order is already paid, return success immediately
    const existingOrder = await Order.findById(orderId);
    if (existingOrder && existingOrder.paymentStatus === "PAID") {
        return { success: true, message: "Payment already verified", order: existingOrder };
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const body = razorpayOrderId + "|" + razorpayPaymentId;

        const expectedSignature = crypto
            .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpaySignature;

        if (!isAuthentic) {
            await Payment.findOneAndUpdate(
                { razorpayOrderId },
                {
                    status: "FAILED",
                    failureReason: "Invalid Signature",
                    razorpayPaymentId
                },
                { session } // Note: writes in transaction might not persist if aborted, but we want to record failure.
                // Actually for failure logging usually we want to commit the failure.
                // So we might split this.
            );
            // If signature is invalid, we throw, but we might want to log it first.
            // For strict ACID, if we abort, we lose the log. 
            // Ideally we run the log in a separate operation or commit the failure.
            throw new Error("Invalid payment signature");
        }

        // 1. Update Payment Record
        const payment = await Payment.findOneAndUpdate(
            { razorpayOrderId },
            {
                status: "PAID",
                razorpayPaymentId,
                method: "RAZORPAY"
            },
            { new: true, session }
        );

        if (!payment) {
            // Fallback if payment record wasn't created (edge case)
            await Payment.create([{
                orderId,
                razorpayOrderId,
                razorpayPaymentId,
                amount: 0, // Unknown if not found
                status: "PAID",
                method: "RAZORPAY"
            }], { session });
        }

        // 2. Update Order
        const order = await Order.findByIdAndUpdate(
            orderId,
            {
                paymentStatus: "PAID",
                paymentMethod: "ONLINE",
                transactionId: razorpayPaymentId,
                $push: {
                    history: {
                        status: "PAID",
                        note: `Payment verified. ID: ${razorpayPaymentId}`,
                        timestamp: new Date()
                    }
                }
            },
            { new: true, session }
        );

        if (!order) throw new Error("Order not found");

        await session.commitTransaction();
        return { success: true, message: "Payment verified", order };

    } catch (error) {
        await session.abortTransaction();

        // Try to log failure outside transaction
        try {
            await Payment.findOneAndUpdate(
                { razorpayOrderId },
                {
                    status: "FAILED",
                    failureReason: error.message,
                    razorpayPaymentId
                }
            );
        } catch (e) {
            console.error("Failed to log payment failure", e);
        }

        console.error("Payment Verification Failed:", error);
        throw error;
    } finally {
        session.endSession();
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

export const handleRazorpayWebhook = async (webhookPayload, signature) => {
    if (!razorpay) throw new Error("Razorpay not configured");

    // 1. Verify Signature
    const isVerified = Razorpay.validateWebhookSignature(
        JSON.stringify(webhookPayload),
        signature,
        env.RAZORPAY_WEBHOOK_SECRET
    );

    if (!isVerified) {
        throw new Error("Invalid Webhook Signature");
    }

    const { event, payload } = webhookPayload;
    console.log(`DEBUG: Received Webhook Event: ${event}`);

    // 2. Handle specific events
    if (event === "order.paid") {
        const rzOrder = payload.order.entity;
        const rzPayment = payload.payment ? payload.payment.entity : null;

        // Find order by razorpayOrderId (stored during checkout)
        const order = await Order.findOne({ razorpayOrderId: rzOrder.id });
        if (!order) return { processed: false, reason: "Order not found" };

        // Idempotency check: Already paid?
        if (order.paymentStatus === "PAID") return { processed: true, message: "Already paid" };

        // Update Order
        order.paymentStatus = "PAID";
        order.orderStatus = "CONFIRMED"; // Confirm order on payment
        order.razorpayPaymentId = rzPayment ? rzPayment.id : order.razorpayPaymentId;

        // Generate Invoice Number if not already present
        if (!order.invoiceNumber) {
            order.invoiceNumber = await orderService.generateInvoiceNumber();
        }

        order.history.push({
            status: "PAID",
            note: `Confirmed via Webhook (Payment: ${order.razorpayPaymentId})`
        });

        await order.save();

        // Log Payment for Audit
        if (rzPayment) {
            await Payment.findOneAndUpdate(
                { razorpayOrderId: rzOrder.id },
                {
                    status: "PAID",
                    razorpayPaymentId: rzPayment.id,
                    method: rzPayment.method,
                    amount: rzPayment.amount / 100,
                    rawResponse: payload
                },
                { upsert: true }
            );
        }

        // 3. Send Notifications
        try {
            const customer = await User.findById(order.user);
            if (customer) {
                const customerName = customer.name || order.shippingAddress?.name || "Customer";
                const customerPhone = customer.phoneNumber || order.shippingAddress?.phone;
                const customerEmail = customer.email;

                // 3a. Send SMS (DLT Template 205882: Order Confirmed)
                if (customerPhone) {
                    await smsService.sendDLTSms("205882", customerPhone, [
                        customerName,
                        order.salesOrderNumber || order.orderNumber
                    ]);
                }

                // 3b. Send Email
                if (customerEmail) {
                    const templatePath = path.resolve(process.cwd(), "src/templates/email/order-confirmed.html");
                    if (fs.existsSync(templatePath)) {
                        let html = fs.readFileSync(templatePath, "utf-8");
                        html = html
                            .replace("{{customerName}}", customerName)
                            .replace("{{orderNumber}}", order.orderNumber)
                            .replace("{{invoiceNumber}}", order.invoiceNumber)
                            .replace("{{totalAmount}}", order.totalAmount)
                            .replace("{{orderId}}", order._id)
                            .replace("{{clientUrl}}", env.CLIENT_URL?.[0] || "http://localhost:3000");

                        await emailService.sendEmail({
                            to: customerEmail,
                            subject: `Order Confirmed - ${order.orderNumber}`,
                            html
                        });
                    }
                }
            }
        } catch (notifError) {
            console.error("⚠️ Notification failed (non-fatal):", notifError.message);
        }

        return { processed: true, orderId: order._id };
    }

    return { processed: false, reason: "Unhandled event" };
};
