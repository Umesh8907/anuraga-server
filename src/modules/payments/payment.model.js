import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
    {
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true
        },
        razorpayOrderId: {
            type: String,
            required: true
        },
        razorpayPaymentId: {
            type: String
        },
        amount: {
            type: Number,
            required: true
        },
        currency: {
            type: String,
            default: "INR"
        },
        status: {
            type: String,
            enum: ["CREATED", "ATTEMPTED", "PAID", "FAILED"],
            default: "CREATED"
        },
        method: {
            type: String
        },
        rawResponse: {
            type: Object
        },
        errorCorrelationId: {
            type: String
        },
        failureReason: {
            type: String
        }
    },
    { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
