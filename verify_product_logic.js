import dotenv from "dotenv";
import mongoose from "mongoose";
import productService from "./src/modules/products/product.service.js";

dotenv.config();

async function test() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        const testProduct = {
            name: "Test Product " + Date.now(),
            description: "A test product for validation",
            images: ["http://example.com/image.jpg"],
            variants: [
                {
                    label: "250g",
                    price: 150,
                    mrp: 200,
                    stock: 50,
                    isDefault: true
                }
            ]
        };

        console.log("Creating product...");
        const product = await productService.createProduct(testProduct);
        console.log("Product created with slug:", product.slug);

        console.log("Testing slug collision...");
        const product2 = await productService.createProduct(testProduct);
        console.log("Second product created with slug:", product2.slug);

        if (product.slug === product2.slug) {
            console.error("Slug collision failed! Both products have the same slug.");
        } else {
            console.log("Slug collision test passed: Slugs are unique.");
        }

        console.log("Testing validation (Invalid price)...");
        try {
            await productService.createProduct({
                ...testProduct,
                name: "Invalid price product",
                variants: [
                    {
                        label: "250g",
                        price: 250,
                        mrp: 200,
                        stock: 50,
                        isDefault: true
                    }
                ]
            });
            console.error("Validation failed! It should have thrown an error for price > mrp.");
        } catch (error) {
            console.log("Validation test passed: Caught expected error:", error.message);
        }

        // Cleanup
        await mongoose.connection.db.collection("products").deleteMany({ name: { $regex: "Test Product" } });
        await mongoose.connection.db.collection("products").deleteOne({ name: "Invalid price product" });
        console.log("Cleaned up test products.");

    } catch (error) {
        console.error("Test failed:", error);
    } finally {
        await mongoose.disconnect();
    }
}

test();
