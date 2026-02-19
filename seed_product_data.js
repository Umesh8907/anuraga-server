import mongoose from "mongoose";
import Product from "./src/modules/products/product.model.js";
import dotenv from "dotenv";

dotenv.config();

const seedData = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) throw new Error("MONGODB_URI not found");

        await mongoose.connect(uri);
        console.log("Connected to MongoDB");

        // Find a product or create a dummy one
        let product = await Product.findOne({ slug: "spicy-garlic-pickle" });

        if (!product) {
            console.log("Product not found, creating dummy 'spicy-garlic-pickle'");
            product = new Product({
                name: "Spicy Garlic Pickle",
                slug: "spicy-garlic-pickle",
                description: "Experience the bold and fiery taste of our traditional Spicy Garlic Pickle. Made with slow-roasted garlic cloves and a secret blend of hand-pounded spices, this pickle is the perfect accompaniment to any Indian meal.",
                images: ["https://images.unsplash.com/photo-1589135398309-11440026e63d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
                variants: [
                    { label: "250g", price: 199, mrp: 249, type: "SIZE", stock: 50, isDefault: true },
                    { label: "500g", price: 349, mrp: 449, type: "SIZE", stock: 30 },
                    { label: "Family Pack (Pack of 2)", price: 649, mrp: 898, type: "COMBO", stock: 15 }
                ]
            });
        }

        // Add rich metadata
        product.brand = "Anuraga";
        product.flavor = "Spicy & Tangy";
        product.itemForm = "Pickle";
        product.packagingType = "Glass Jar";
        product.storageInstruction = "Store in a cool, dry place. Use a dry spoon.";
        product.dietaryPreference = "Vegetarian, Gluten-Free";
        product.ingredients = "Garlic, Mustard Oil, Fenugreek, Mustard Seeds, Red Chili Powder, Turmeric, Salt, Asafoetida.";

        product.keyBenefits = [
            { title: "Helps in digestion", icon: "Leaf" },
            { title: "Immunity booster", icon: "Shield" },
            { title: "No preservatives", icon: "Check" },
            { title: "Gut health friendly", icon: "Activity" }
        ];

        product.keyIngredients = [
            {
                name: "Garlic",
                image: "https://images.unsplash.com/photo-1589135398309-11440026e63d?q=80&w=200&h=200&auto=format&fit=crop",
                description: "Hand-picked organic garlic cloves for maximum flavor."
            },
            {
                name: "Mustard Oil",
                image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=200&h=200&auto=format&fit=crop",
                description: "Pure cold-pressed mustard oil for traditional preservation."
            }
        ];

        product.expertBadges = ["Researched by Experts", "Ayurvedic Recipe"];

        await product.save();
        console.log("✅ Product seeded with new schema fields.");

    } catch (error) {
        console.error("Error seeding data:", error);
    } finally {
        await mongoose.disconnect();
    }
};

seedData();
