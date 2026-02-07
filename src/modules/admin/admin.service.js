import User from "../users/user.model.js";
import Order from "../orders/order.model.js";
import Product from "../products/product.model.js";

export const getDashboardStats = async () => {
    // 1. Total Counts
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    // 2. Revenue Calculation (only PAID orders)
    const revenueAgg = await Order.aggregate([
        { $match: { paymentStatus: "PAID" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

    // 3. Recent Orders
    const recentOrders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("user", "name email")
        .select("totalAmount status createdAt");

    // 4. Order Status Breakdown
    const orderStatusBreakdown = await Order.aggregate([
        { $group: { _id: "$orderStatus", count: { $sum: 1 } } }
    ]);

    return {
        counts: {
            users: totalUsers,
            products: totalProducts,
            orders: totalOrders,
            revenue: totalRevenue
        },
        orderStatusBreakdown,
        recentOrders
    };
};
