import mongoose from "mongoose";
import env from "../src/config/env.js";
import Collection from "../src/modules/collections/collection.model.js";

const collectionsData = [
    {
        name: "All Products",
        slug: "all-products",
        description: "Browse all our organic products",
        isActive: true,
        seo: {
            title: "All Organic Products",
            description: "Explore all organic pickles, spices, and flours"
        }
    },
    {
        name: "Mango Pickles",
        slug: "mango-pickles",
        description: "Traditional homemade mango pickles",
        isActive: true,
        seo: {
            title: "Organic Mango Pickles",
            description: "Authentic South Indian organic mango pickles"
        }
    },
    {
        name: "Garlic Pickles",
        slug: "garlic-pickles",
        description: "Spicy and flavorful garlic pickles",
        isActive: true
    },
    {
        name: "Combos",
        slug: "combos",
        description: "Value combo packs of pickles and spices",
        isActive: true
    },
    {
        name: "Festive Deals",
        slug: "festive-deals",
        description: "Special festive offers and discounts",
        isActive: true
    },
    {
        name: "Spice Powders",
        slug: "spice-powders",
        description: "Pure organic spice powders",
        isActive: true
    },
    {
        name: "Organic Atta",
        slug: "organic-atta",
        description: "Stone-ground organic flours",
        isActive: true
    }
];

const seedCollections = async () => {
    try {
        await mongoose.connect(env.MONGODB_URI);
        console.log("✅ MongoDB connected for seeding");

        // Optional: clear existing collections
        await Collection.deleteMany({});
        console.log("🧹 Existing collections cleared");

        await Collection.insertMany(collectionsData);
        console.log("🌱 Collections seeded successfully");

        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed");
        console.error(error);
        process.exit(1);
    }
};

seedCollections();
