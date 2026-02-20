import dotenv from "dotenv";
import mongoose from "mongoose";
import inventoryService from "./src/modules/inventory/inventory.service.js";
import Product from "./src/modules/products/product.model.js";

dotenv.config();

async function testInventory() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        // Create a dummy product for testing
        const product = new Product({
            name: "Inventory Test Product",
            slug: "inventory-test-" + Date.now(),
            images: ["http://example.com/img.jpg"],
            variants: [{
                label: "Tester",
                price: 100,
                mrp: 120,
                stock: 10,
                realStock: 10,
                inStock: 10,
                isDefault: true
            }]
        });
        await product.save();
        const variantId = product.variants[0]._id;

        console.log("Initial stock: 10");

        console.log("Applying IN transaction (+5)...");
        await inventoryService.adjustStock({
            productId: product._id,
            variantId,
            quantity: 5,
            type: "IN",
            reason: "Test In",
            userId: null
        });

        let updatedProduct = await Product.findById(product._id);
        let variant = updatedProduct.variants.id(variantId);
        console.log(`Current Stock: ${variant.stock}, Real: ${variant.realStock}, InStock: ${variant.inStock}`);

        if (variant.stock === 15 && variant.realStock === 15 && variant.inStock === 15) {
            console.log("IN test passed.");
        } else {
            console.error("IN test failed!");
        }

        console.log("Applying OUT transaction (-3)...");
        await inventoryService.adjustStock({
            productId: product._id,
            variantId,
            quantity: 3,
            type: "OUT",
            reason: "Test Out",
            userId: null
        });

        updatedProduct = await Product.findById(product._id);
        variant = updatedProduct.variants.id(variantId);
        console.log(`Current Stock: ${variant.stock}, Real: ${variant.realStock}, InStock: ${variant.inStock}`);

        if (variant.stock === 12 && variant.realStock === 12 && variant.inStock === 12) {
            console.log("OUT test passed.");
        } else {
            console.error("OUT test failed!");
        }

        // Cleanup
        await Product.findByIdAndDelete(product._id);
        console.log("Cleaned up inventory test product.");

    } catch (error) {
        console.error("Test failed:", error);
    } finally {
        await mongoose.disconnect();
    }
}

testInventory();
