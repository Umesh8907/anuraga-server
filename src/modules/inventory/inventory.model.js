import mongoose from "mongoose";

const inventoryTransactionSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        variantId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        variantLabel: {
            type: String
        },
        type: {
            type: String,
            enum: ["IN", "OUT", "ADJUSTMENT"],
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        previousStock: {
            type: Number
        },
        currentStock: {
            type: Number
        },
        reason: {
            type: String,
            required: true
        },
        referenceId: {
            type: String // Order ID or other ref
        },
        performedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    { timestamps: true }
);

const InventoryTransaction = mongoose.model("InventoryTransaction", inventoryTransactionSchema);

export default InventoryTransaction;
