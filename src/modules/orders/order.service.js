import Order from "./order.model.js";
import cartService from "../cart/cart.service.js";
import Product from "../products/product.model.js";
import inventoryService from "../inventory/inventory.service.js";
import deliveryService from "../delivery/delivery.service.js";
import * as paymentService from "../payments/payment.service.js";
import * as smsService from "../notifications/sms.service.js";
import User from "../users/user.model.js";
import AppError from "../../utils/AppError.js";

const GST_RATE = 0.05; // 5% GST
const FREE_DELIVERY_THRESHOLD = 500;
const STANDARD_DELIVERY_CHARGE = 49;

/**
 * Calculates taxable amount and GST from a GST-inclusive price
 */
const reverseGst = (inclusivePrice, rate) => {
    const taxable = inclusivePrice / (1 + rate);
    const gst = inclusivePrice - taxable;
    return {
        taxable: Math.round(taxable * 100) / 100,
        gst: Math.round(gst * 100) / 100
    };
};

/**
 * Generates next sequential order number: SO-YYMMDD-XXX
 */
const generateOrderNumber = async () => {
    const today = new Date();
    const datePart = today.toISOString().slice(2, 10).replace(/-/g, ""); // YYMMDD

    const lastOrder = await Order.findOne({ orderNumber: new RegExp(`^SO-${datePart}-`) })
        .sort({ createdAt: -1 });

    let sequence = 1;
    if (lastOrder && lastOrder.orderNumber) {
        const parts = lastOrder.orderNumber.split("-");
        if (parts.length === 3) {
            sequence = parseInt(parts[2], 10) + 1;
        }
    }

    return `SO-${datePart}-${sequence.toString().padStart(3, "0")}`;
};

/**
 * Generates next sequential invoice number: FY2025-26/XXXX
 */
export const generateInvoiceNumber = async () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;

    let fyStart, fyEnd;
    if (month >= 4) {
        fyStart = year;
        fyEnd = (year + 1).toString().slice(-2);
    } else {
        fyStart = year - 1;
        fyEnd = year.toString().slice(-2);
    }
    const fy = `FY${fyStart}-${fyEnd}`;

    const lastOrder = await Order.findOne({ invoiceNumber: new RegExp(`^${fy}/`) })
        .sort({ createdAt: -1 });

    let sequence = 1;
    if (lastOrder && lastOrder.invoiceNumber) {
        const parts = lastOrder.invoiceNumber.split("/");
        if (parts.length === 2) {
            sequence = parseInt(parts[1], 10) + 1;
        }
    }

    return `${fy}/${sequence.toString().padStart(4, "0")}`;
};

export const createOrder = async (userId, orderData) => {
    console.log("DEBUG: Service createOrder - userId:", userId);

    // 1. Get user's cart
    const cart = await cartService.getCartByUser(userId);
    if (!cart || cart.items.length === 0) {
        throw new Error("Cart is empty");
    }

    // 1.1 Validate Delivery Availability
    const pincode = orderData.shippingAddress.pincode;
    const deliveryIssues = await deliveryService.validateCheckoutAvailability(
        cart.items.map(item => ({ productId: item.product })),
        pincode
    );

    if (deliveryIssues.length > 0) {
        throw new AppError(400, `Some items are not deliverable to ${pincode}: ${deliveryIssues.map(i => i.message).join(', ')}`);
    }

    // 2. Prepare Financials and Order Items
    const orderItems = [];
    const bulkEnvOperations = [];

    let subTotal = 0;
    let taxableSubTotal = 0;
    let totalCgst = 0;
    let totalSgst = 0;

    for (const item of cart.items) {
        const product = await Product.findById(item.product);
        if (!product) throw new Error(`Product not found`);

        const variant = product.variants.find(v => v._id.toString() === item.variantId.toString());
        if (!variant) throw new Error(`Variant not found`);

        if (variant.stock < item.quantity) {
            throw new Error(`Insufficient stock for ${product.name}`);
        }

        // Financials per item
        const itemPrice = item.price; // This is the inclusive price
        const { taxable, gst } = reverseGst(itemPrice, GST_RATE);
        const cgst = Math.round((gst / 2) * 100) / 100;
        const sgst = Math.round((gst / 2) * 100) / 100;

        orderItems.push({
            product: item.product,
            variant: item.variantId,
            name: item.variantLabel,
            price: itemPrice,
            quantity: item.quantity,
            taxableAmount: taxable * item.quantity,
            cgst: cgst * item.quantity,
            sgst: sgst * item.quantity,
            total: itemPrice * item.quantity
        });

        subTotal += itemPrice * item.quantity;
        taxableSubTotal += taxable * item.quantity;
        totalCgst += cgst * item.quantity;
        totalSgst += sgst * item.quantity;

        bulkEnvOperations.push({
            updateOne: {
                filter: { _id: product._id, "variants._id": variant._id },
                update: { $inc: { "variants.$.stock": -item.quantity } }
            }
        });
    }

    // 3. Delivery Charge and Grand Total
    const deliveryCharge = subTotal < FREE_DELIVERY_THRESHOLD ? STANDARD_DELIVERY_CHARGE : 0;
    const totalAmount = subTotal + deliveryCharge;
    const totalTax = totalCgst + totalSgst;

    // 4. Generate Order Number
    const orderNumber = await generateOrderNumber();

    // 5. Create Order
    const order = new Order({
        orderNumber,
        user: userId,
        items: orderItems,
        subTotal,
        taxableSubTotal,
        totalTax,
        cgst: totalCgst,
        sgst: totalSgst,
        deliveryCharge,
        totalAmount,
        shippingAddress: orderData.shippingAddress,
        paymentMethod: orderData.paymentMethod,
        history: [{ status: "PENDING", note: "Order Placed" }]
    });

    await order.save();

    // 6. Update Inventory
    await Product.bulkWrite(bulkEnvOperations);
    for (const item of orderItems) {
        await inventoryService.logTransaction({
            product: item.product,
            variantId: item.variant,
            variantLabel: item.name,
            type: "OUT",
            quantity: item.quantity,
            reason: `Order #${orderNumber}`,
            referenceId: order._id.toString(),
            performedBy: userId
        });
    }

    // 7. Clear Cart
    await cartService.clearCart(userId);

    // 8. If Online, initiate Razorpay order
    if (order.paymentMethod === "ONLINE") {
        const razorpayOrder = await paymentService.createRazorpayOrder(order._id);
        return {
            order,
            razorpayOrder
        };
    }

    return order;
};

export const getOrderById = async (orderId) => {
    return await Order.findById(orderId).populate("items.product");
};

export const getOrdersByUser = async (userId) => {
    return await Order.find({ user: userId }).sort({ createdAt: -1 });
};

export const getAllOrders = async (query = {}) => {
    const { page = 1, limit = 10, status } = query;
    const filter = {};
    if (status) filter.orderStatus = status;

    const orders = await Order.find(filter)
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

    const count = await Order.countDocuments(filter);

    return {
        orders,
        totalPages: Math.ceil(count / limit),
        currentPage: page
    };
};

const VALID_TRANSITIONS = {
    "PENDING": ["CONFIRMED", "CANCELLED"],
    "CONFIRMED": ["SHIPPED", "CANCELLED"],
    "SHIPPED": ["DELIVERED"], // Once shipped, usually delivered. Cancellation might need return process.
    "DELIVERED": [], // Terminal state
    "CANCELLED": []  // Terminal state
};

/**
 * Validates if an order can transition from currentStatus to newStatus
 * @param {string} currentStatus 
 * @param {string} newStatus 
 * @throws {AppError} if transition is invalid
 */
const validateStatusTransition = (currentStatus, newStatus) => {
    const allowedStatuses = VALID_TRANSITIONS[currentStatus] || [];
    if (!allowedStatuses.includes(newStatus)) {
        throw new AppError(400, `Invalid status transition from ${currentStatus} to ${newStatus}`);
    }
};

export const updateOrderStatus = async (orderId, status, note = "") => {
    const order = await Order.findById(orderId);
    if (!order) throw new AppError(404, "Order not found");

    // Validate transition
    validateStatusTransition(order.orderStatus, status);

    // specific check for CANCELLED to ensure we use the cancel logic (restocking etc)
    if (status === "CANCELLED") {
        return await cancelOrder(orderId, note || "Cancelled via Status Update");
    }

    order.orderStatus = status;
    order.history.push({
        status,
        note,
        timestamp: new Date()
    });

    return await order.save();
};

export const cancelOrder = async (orderId, reason = "Cancelled") => {
    const order = await Order.findById(orderId);
    if (!order) throw new Error("Order not found");

    if (order.orderStatus === "CANCELLED" || order.paymentStatus === "PAID") {
        throw new Error("Order cannot be cancelled");
    }

    // 1. Restore Stock
    const bulkEnvOperations = [];
    for (const item of order.items) {
        bulkEnvOperations.push({
            updateOne: {
                filter: { _id: item.product, "variants._id": item.variant },
                update: { $inc: { "variants.$.stock": item.quantity } }
            }
        });

        // Log Inventory Transaction (IN)
        await inventoryService.logTransaction({
            product: item.product,
            variantId: item.variant,
            variantLabel: item.name,
            type: "IN",
            quantity: item.quantity,
            reason: `Order Cancellation #${order._id}`,
            referenceId: order._id.toString(),
            performedBy: order.user
        });
    }

    await Product.bulkWrite(bulkEnvOperations);

    // 2. Update Order Status
    order.orderStatus = "CANCELLED";
    order.history.push({
        status: "CANCELLED",
        note: reason,
        timestamp: new Date()
    });

    return await order.save();
};
