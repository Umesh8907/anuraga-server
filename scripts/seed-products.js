import mongoose from "mongoose";
import env from "../src/config/env.js";

import Product from "../src/modules/products/product.model.js";
import Collection from "../src/modules/collections/collection.model.js";

const seedProducts = async () => {
    try {
        await mongoose.connect(env.MONGODB_URI);
        console.log("✅ MongoDB connected for product seeding");

        // Fetch collections
        const mangoCollection = await Collection.findOne({ slug: "mango-pickles" });
        const garlicCollection = await Collection.findOne({ slug: "garlic-pickles" });
        const comboCollection = await Collection.findOne({ slug: "combos" });
        const spiceCollection = await Collection.findOne({ slug: "spice-powders" });
        const attaCollection = await Collection.findOne({ slug: "organic-atta" });

        if (!mangoCollection || !garlicCollection || !comboCollection) {
            throw new Error("❌ Required collections not found. Seed collections first.");
        }

        // Clear existing products (dev only)
        await Product.deleteMany({});
        console.log("🧹 Existing products cleared");

        const products = [
            // 🥭 Mango Pickle
            {
                name: "Homemade Mango Pickle",
                slug: "homemade-mango-pickle",
                description: "Traditional South Indian homemade mango pickle made with organic ingredients.",
                images: [],
                isCombo: false,
                quantityFixed: false,
                collections: [mangoCollection._id],
                variants: [
                    {
                        label: "250g",
                        price: 249,
                        mrp: 299,
                        stock: 100,
                        isDefault: true
                    },
                    {
                        label: "500g",
                        price: 449,
                        mrp: 499,
                        stock: 60
                    }
                ]
            },

            // 🧄 Garlic Pickle
            {
                name: "Spicy Garlic Pickle",
                slug: "spicy-garlic-pickle",
                description: "Bold and spicy garlic pickle prepared in traditional style.",
                images: [],
                isCombo: false,
                quantityFixed: false,
                collections: [garlicCollection._id],
                variants: [
                    {
                        label: "250g",
                        price: 229,
                        stock: 80,
                        isDefault: true
                    },
                    {
                        label: "500g",
                        price: 429,
                        stock: 40
                    }
                ]
            },

            // 🌶️ Spice Powder
            {
                name: "Organic Red Chilli Powder",
                slug: "organic-red-chilli-powder",
                description: "Stone-ground organic red chilli powder with rich aroma.",
                images: [],
                isCombo: false,
                quantityFixed: false,
                collections: [spiceCollection._id],
                variants: [
                    {
                        label: "200g",
                        price: 199,
                        stock: 70,
                        isDefault: true
                    },
                    {
                        label: "500g",
                        price: 399,
                        stock: 30
                    }
                ]
            },

            // 🌾 Organic Atta
            {
                name: "Organic Whole Wheat Atta",
                slug: "organic-whole-wheat-atta",
                description: "Stone-ground organic whole wheat flour.",
                images: [],
                isCombo: false,
                quantityFixed: false,
                collections: [attaCollection._id],
                variants: [
                    {
                        label: "1kg",
                        price: 299,
                        stock: 100,
                        isDefault: true
                    },
                    {
                        label: "5kg",
                        price: 1399,
                        stock: 25
                    }
                ]
            },

            // 🎁 Combo Product
            {
                name: "Pickle Combo Pack",
                slug: "pickle-combo-pack",
                description: "Combo pack of our best-selling organic pickles.",
                images: [],
                isCombo: true,
                quantityFixed: true,
                collections: [comboCollection._id],
                variants: [
                    {
                        label: "200g x 2",
                        price: 399,
                        stock: 50,
                        isDefault: true
                    },
                    {
                        label: "500g x 2",
                        price: 699,
                        stock: 20
                    }
                ]
            }
        ];

        await Product.insertMany(products);
        console.log("🌱 Products seeded successfully");

        process.exit(0);
    } catch (error) {
        console.error("❌ Product seeding failed");
        console.error(error);
        process.exit(1);
    }
};

seedProducts();
