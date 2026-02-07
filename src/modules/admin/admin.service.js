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

    // 5. Low Stock Alert (Products with < 10 items)
    const lowStockProducts = await Product.find({ "variants.stock": { $lt: 10 } })
        .select("name variants")
        .limit(10);

    // 6. Sales Graph Data (Last 7 days)
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const salesGraph = await Order.aggregate([
        {
            $match: {
                createdAt: { $gte: last7Days },
                paymentStatus: "PAID"
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                dailyRevenue: { $sum: "$totalAmount" },
                orderCount: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    // 7. Top Selling Products
    const topProducts = await Order.aggregate([
        { $match: { paymentStatus: "PAID" } },
        { $unwind: "$items" },
        {
            $group: {
                _id: "$items.product",
                name: { $first: "$items.name" },
                totalSold: { $sum: "$items.quantity" },
                revenue: { $sum: "$items.total" }
            }
        },
        { $sort: { totalSold: -1 } },
        { $limit: 5 }
    ]);

    // 8. Revenue by Collection
    const revenueByCollection = await Order.aggregate([
        { $match: { paymentStatus: "PAID" } },
        { $unwind: "$items" },
        {
            $lookup: {
                from: "products",
                localField: "items.product",
                foreignField: "_id",
                as: "productData"
            }
        },
        { $unwind: "$productData" },
        { $unwind: "$productData.collections" },
        {
            $lookup: {
                from: "collections",
                localField: "productData.collections",
                foreignField: "_id",
                as: "collectionData"
            }
        },
        { $unwind: "$collectionData" },
        {
            $group: {
                _id: "$collectionData.name",
                totalRevenue: { $sum: "$items.total" }
            }
        },
        { $sort: { totalRevenue: -1 } }
    ]);

    return {
        counts: {
            users: totalUsers,
            products: totalProducts,
            orders: totalOrders,
            revenue: totalRevenue
        },
        orderStatusBreakdown,
        recentOrders,
        lowStockProducts,
        salesGraph,
        topProducts,
        revenueByCollection
    };
};

export const getUsers = async (query = {}) => {
    const { page = 1, limit = 10, search } = query;
    const filter = {};

    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } }
        ];
    }

    const users = await User.find(filter)
        .select("-passwordHash -refreshTokens")
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

    const count = await User.countDocuments(filter);

    return {
        users,
        totalPages: Math.ceil(count / limit),
        currentPage: page
    };
};

export const updateUserStatus = async (userId, status) => {
    return await User.findByIdAndUpdate(userId, { status }, { new: true });
};
