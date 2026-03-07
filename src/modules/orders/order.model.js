import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    variant: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    name: { type: String, required: true },
    image: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    discount: { type: Number, default: 0 },
    taxableAmount: { type: Number, required: true },
    cgst: { type: Number, default: 0 },
    sgst: { type: Number, default: 0 },
    igst: { type: Number, default: 0 },
    utgst: { type: Number, default: 0 },
    total: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema(
    {
        orderNumber: {
            type: String,
            unique: true
        },
        invoiceNumber: {
            type: String,
            unique: true,
            sparse: true
        },
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
        subTotal: { type: Number, default: 0 },
        taxableSubTotal: { type: Number, default: 0 },
        totalTax: { type: Number, default: 0 },
        cgst: { type: Number, default: 0 },
        sgst: { type: Number, default: 0 },
        igst: { type: Number, default: 0 },
        utgst: { type: Number, default: 0 },
        deliveryCharge: { type: Number, default: 0 },
        totalAmount: {
            type: Number,
            required: true
        },
        razorpayOrderId: { type: String },
        razorpayPaymentId: { type: String },
        history: [
            {
                status: { type: String, required: true },
                note: { type: String },
                timestamp: { type: Date, default: Date.now }
            }
        ]
    },
    { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
