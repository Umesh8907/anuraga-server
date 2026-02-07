import Order from "./order.model.js";
import cartService from "../cart/cart.service.js";
import Product from "../products/product.model.js";
import inventoryService from "../inventory/inventory.service.js";

export const createOrder = async (userId, orderData) => {
    // 1. Get user's cart
    const cart = await cartService.getCartByUser(userId);

    if (!cart || cart.items.length === 0) {
        throw new Error("Cart is empty");
    }

    // 2. Create order items from cart and validate stock
    const orderItems = [];
    const bulkEnvOperations = [];

    for (const item of cart.items) {
        const product = await Product.findById(item.product);
        if (!product) throw new Error(`Product not found for item ${item.variantLabel}`);

        const variant = product.variants.find(v => v._id.toString() === item.variantId.toString());
        if (!variant) throw new Error(`Variant not found for item ${item.variantLabel}`);

        if (variant.stock < item.quantity) {
            throw new Error(`Insufficient stock for ${product.name} (${variant.label})`);
        }

        orderItems.push({
            product: item.product,
            variant: item.variantId,
            name: item.variantLabel,
            price: item.price,
            quantity: item.quantity,
            total: item.price * item.quantity
        });

        // Prepare bulk update operation to decrement stock
        bulkEnvOperations.push({
            updateOne: {
                filter: { _id: product._id, "variants._id": variant._id },
                update: { $inc: { "variants.$.stock": -item.quantity } }
            }
        });
    }

    // 3. Calculate total amount
    const totalAmount = orderItems.reduce((sum, item) => sum + item.total, 0);

    // Sanitize shipping address
    const { _id, isDefault, ...shippingDetails } = orderData.shippingAddress;

    // 4. Create Order
    const order = new Order({
        user: userId,
        items: orderItems,
        totalAmount,
        shippingAddress: {
            name: shippingDetails.name,
            phone: shippingDetails.phone,
            addressLine1: shippingDetails.addressLine1,
            city: shippingDetails.city,
            state: shippingDetails.state,
            pincode: shippingDetails.pincode
        },
        paymentMethod: orderData.paymentMethod,
        history: [
            {
                status: "PENDING",
                note: "Order Placed",
                timestamp: new Date()
            }
        ]
    });

    await order.save(); // Save order first

    // 5. Decrement Stock and Log Transactions
    await Product.bulkWrite(bulkEnvOperations);

    // Log Inventory Transactions
    for (const item of orderItems) {
        await inventoryService.logTransaction({
            product: item.product,
            variantId: item.variant,
            variantLabel: item.name,
            type: "OUT",
            quantity: item.quantity,
            reason: `Order #${order._id}`,
            referenceId: order._id.toString(),
            performedBy: userId
        });
    }

    // 6. Clear Cart
    await cartService.clearCart(userId);

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

export const updateOrderStatus = async (orderId, status, note = "") => {
    const order = await Order.findById(orderId);
    if (!order) throw new Error("Order not found");

    order.orderStatus = status;
    order.history.push({
        status,
        note,
        timestamp: new Date()
    });

    return await order.save();
};
