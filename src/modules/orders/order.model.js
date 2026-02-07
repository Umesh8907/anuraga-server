import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    variant: {
        type: mongoose.Schema.Types.ObjectId, // If using variants
        required: false
    },
    name: { type: String, required: true },
    image: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    total: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        items: [orderItemSchema],
        shippingAddress: {
            name: { type: String, required: true },
            addressLine1: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            pincode: { type: String, required: true },
            phone: { type: String, required: true }
        },
        paymentMethod: {
            type: String,
            enum: ["COD", "ONLINE"],
            required: true,
            default: "COD"
        },
        paymentStatus: {
            type: String,
            enum: ["PENDING", "PAID", "FAILED"],
            default: "PENDING"
        },
        orderStatus: {
            type: String,
            enum: [
                "PENDING",
                "CONFIRMED",
                "SHIPPED",
                "DELIVERED",
                "CANCELLED"
            ],
            default: "PENDING"
        },
        totalAmount: {
            type: Number,
            required: true
        },
        transactionId: {
            type: String // For online payments
        }
    },
    { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
