import mongoose from "mongoose";
import env from "../src/config/env.js";
import Product from "../src/modules/products/product.model.js";
import Collection from "../src/modules/collections/collection.model.js";

const seedRichProducts = async () => {
    try {
        await mongoose.connect(env.MONGODB_URI);
        console.log("✅ MongoDB connected for rich product seeding");

        // Fetch collections
        const mangoCollection = await Collection.findOne({ slug: "mango-pickles" });
        const garlicCollection = await Collection.findOne({ slug: "garlic-pickles" });
        const comboCollection = await Collection.findOne({ slug: "combos" });
        const spiceCollection = await Collection.findOne({ slug: "spice-powders" });
        const attaCollection = await Collection.findOne({ slug: "organic-atta" });

        if (!mangoCollection || !garlicCollection || !comboCollection) {
            console.error("❌ Required collections not found. Please run seedCollections script first.");
            process.exit(1);
        }

        // Clear existing products
        await Product.deleteMany({});
        console.log("🧹 Existing products cleared");

        const products = [
            {
                name: "Authentic Mango Pickle",
                slug: "authentic-mango-pickle",
                description: "Homemade with hand-cut mangoes and traditional spices. Our mango pickle is preserved naturally without any artificial preservatives.",
                images: ["https://images.unsplash.com/photo-1589135398309-11440026e63d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
                collections: [mangoCollection._id],
                averageRating: 4.8,
                reviewCount: 156,
                tags: ["Best Seller", "Organic"],
                keyBenefits: [
                    { title: "Preservative-Free", icon: "Check" },
                    { title: "Woman-Made", icon: "Leaf" },
                    { title: "Traditional Recipe", icon: "Shield" }
                ],
                keyIngredients: [
                    { name: "Hand-cut Mangoes", image: "https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=200", description: "Sourced from organic orchards in Andhra Pradesh." },
                    { name: "Cold-pressed Mustard Oil", image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=200", description: "Pure oil for natural preservation and rich flavor." }
                ],
                expertBadges: ["Ayurvedic Recipe", "Hygienically Packed"],
                variants: [
                    { label: "250g", price: 199, mrp: 249, stock: 100, isDefault: true },
                    { label: "500g", price: 349, mrp: 449, stock: 60 }
                ]
            },
            {
                name: "Spicy Garlic Pickle",
                slug: "spicy-garlic-pickle-rich",
                description: "Bold and fiery garlic pickle made with farm-fresh garlic cloves. A perfect immunity booster for your daily meals.",
                images: ["https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
                collections: [garlicCollection._id],
                averageRating: 4.9,
                reviewCount: 89,
                tags: ["Immunity", "Spicy"],
                keyBenefits: [
                    { title: "Immunity Booster", icon: "Shield" },
                    { title: "100% Vegan", icon: "Leaf" },
                    { title: "No Sugars", icon: "Activity" }
                ],
                keyIngredients: [
                    { name: "Farm-fresh Garlic", image: "https://images.unsplash.com/photo-1589135398309-11440026e63d?q=80&w=200", description: "Slow-roasted for a nutty aroma." },
                    { name: "Sun-dried Red Chillies", image: "https://images.unsplash.com/photo-1596040033229-a9821ebd05ed?q=80&w=200", description: "Adds the perfect amount of heat." }
                ],
                expertBadges: ["Immunity Focused", "Small Batch Production"],
                variants: [
                    { label: "250g", price: 229, mrp: 299, stock: 80, isDefault: true },
                    { label: "500g", price: 429, mrp: 549, stock: 40 }
                ]
            },
            {
                name: "Organic Red Chilli Powder",
                slug: "organic-red-chilli-powder-rich",
                description: "Vibrant and aromatic red chilli powder, stone-ground to retain natural oils and intense heat.",
                images: ["https://images.unsplash.com/photo-1596040033229-a9821ebd05ed?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
                collections: [spiceCollection._id],
                averageRating: 4.7,
                reviewCount: 42,
                tags: ["Stone Ground", "Pure"],
                keyBenefits: [
                    { title: "Pure Organic", icon: "Leaf" },
                    { title: "No Adulteration", icon: "Shield" }
                ],
                keyIngredients: [
                    { name: "Dried Red Chillies", image: "https://images.unsplash.com/photo-1596040033229-a9821ebd05ed?q=80&w=200", description: "High-grade chillies for bright color and heat." }
                ],
                expertBadges: ["Lab Tested", "Zero Pesticides"],
                variants: [
                    { label: "200g", price: 179, mrp: 229, stock: 120, isDefault: true },
                    { label: "500g", price: 399, mrp: 499, stock: 50 }
                ]
            },
            {
                name: "Best Sellers Combo",
                slug: "best-sellers-combo",
                description: "Get our two most loved pickles in one pack. Perfect for sampling or gifting.",
                images: ["https://images.unsplash.com/photo-1547514711-e556a07f0027?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
                collections: [comboCollection._id],
                averageRating: 5.0,
                reviewCount: 25,
                tags: ["Best Seller", "Value Pack"],
                isCombo: true,
                keyBenefits: [
                    { title: "Value For Money", icon: "Activity" },
                    { title: "Perfect Gift", icon: "Check" }
                ],
                expertBadges: ["Collector's Choice"],
                variants: [
                    { label: "250g x 2", price: 399, mrp: 498, stock: 30, isDefault: true },
                    { label: "500g x 2", price: 699, mrp: 898, stock: 15 }
                ]
            }
        ];

        await Product.insertMany(products);
        console.log("🌱 Rich products seeded successfully with full metadata");

        process.exit(0);
    } catch (error) {
        console.error("❌ Rich product seeding failed");
        console.error(error);
        process.exit(1);
    }
};

seedRichProducts();
