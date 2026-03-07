import Order from "./order.model.js";
import AppError from "../../utils/AppError.js";

/**
 * Prepares structured data for an invoice
 * @param {string} orderId 
 * @returns {Promise<Object>} Invoice data
 */
export const getInvoiceData = async (orderId) => {
    const order = await Order.findById(orderId)
        .populate("user", "name email phone")
        .lean();

    if (!order) {
        throw new AppError(404, "Order not found");
    }

    if (!order.invoiceNumber) {
        throw new AppError(400, "Invoice has not been generated for this order yet (Payment likely pending)");
    }

    // Format for Invoice
    const invoiceData = {
        seller: {
            name: "Anuraga Pickles",
            address: "123, Traditional Street, Andhra Pradesh, India",
            gstin: "37AAAAA0000A1Z5", // Placeholder GSTIN
            phone: "+91 9876543210",
            email: "contact@anuragapickles.com"
        },
        customer: {
            name: order.shippingAddress.name,
            phone: order.shippingAddress.phone,
            address: `${order.shippingAddress.addressLine1}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}`
        },
        order: {
            id: order._id,
            orderNumber: order.orderNumber,
            date: order.createdAt,
            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentStatus
        },
        invoice: {
            number: order.invoiceNumber,
            date: order.updatedAt // Usually invoice date is when it was generated/paid
        },
        items: order.items.map(item => ({
            name: item.name,
            hsn: "2001", // HSN for Pickles
            price: item.price,
            quantity: item.quantity,
            taxableAmount: item.taxableAmount,
            gstRate: "5%",
            cgst: item.cgst,
            sgst: item.sgst,
            total: item.total
        })),
        summary: {
            taxableSubTotal: order.taxableSubTotal,
            totalCgst: order.cgst,
            totalSgst: order.sgst,
            totalTax: order.totalTax,
            deliveryCharge: order.deliveryCharge,
            grandTotal: order.totalAmount
        },
        notes: "Thank you for choosing Anuraga Pickles! Authentic taste, delivered fresh."
    };

    return invoiceData;
};
