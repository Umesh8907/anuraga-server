import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';

// Handling __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the Product model using the relative path from the script's location
// We need to use the absolute path for the model to ensure it's loaded correctly
import Product from "../src/modules/products/product.model.js";

dotenv.config({ path: path.join(__dirname, "../.env") });

const updateMRP = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            console.error("❌ MONGODB_URI not found in .env file");
            process.exit(1);
        }

        console.log("Connecting to MongoDB...");
        await mongoose.connect(uri);
        console.log("✅ Connected to MongoDB");

        const products = await Product.find({});
        console.log(`Found ${products.length} products to check.`);

        let updatedCount = 0;

        for (const product of products) {
            let needsUpdate = false;

            if (product.variants && product.variants.length > 0) {
                product.variants.forEach(variant => {
                    // If MRP is missing, null, 0, or equal to price, set it to 25% more
                    if (!variant.mrp || variant.mrp === 0 || variant.mrp === variant.price) {
                        const newMRP = Math.round(variant.price * 1.25);
                        console.log(`Updating ${product.name} (${variant.label}): Price ${variant.price} -> New MRP ${newMRP}`);
                        variant.mrp = newMRP;
                        needsUpdate = true;
                    }
                });
            }

            if (needsUpdate) {
                await product.save();
                updatedCount++;
            }
        }

        console.log(`\n✅ Database update complete!`);
        console.log(`Total products updated: ${updatedCount}`);

    } catch (error) {
        console.error("❌ Error updating database:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");
    }
};

updateMRP();
