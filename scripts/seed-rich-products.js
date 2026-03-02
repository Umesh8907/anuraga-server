import mongoose from "mongoose";
import env from "../src/config/env.js";
import Product from "../src/modules/products/product.model.js";
import Collection from "../src/modules/collections/collection.model.js";

const seedRichProducts = async () => {
    try {
        await mongoose.connect(env.MONGODB_URI);
        console.log("✅ MongoDB connected for rich product seeding");

        // Fetch collections
        const collections = await Collection.find({});
        const getCollId = (slug) => {
            const coll = collections.find(c => c.slug === slug);
            if (!coll) {
                console.warn(`⚠️ Collection ${slug} not found`);
                return null;
            }
            return coll._id;
        };

        const ids = {
            mango: getCollId("mango-pickles"),
            garlic: getCollId("garlic-pickles"),
            combos: getCollId("combos"),
            spices: getCollId("spice-powders"),
            atta: getCollId("organic-atta"),
            festive: getCollId("festive-deals")
        };

        // Clear existing products
        await Product.deleteMany({});
        console.log("🧹 Existing products cleared");

        const products = [
            // 🥭 MANGO PICKLES
            {
                name: "Authentic Avakaya Mango Pickle",
                slug: "authentic-avakaya-mango-pickle",
                description: "The pride of South India. Our Avakaya is made using a century-old recipe featuring hand-cut sour mangoes, fiery Guntur chillies, and cold-pressed mustard oil. No water, no preservatives, just pure tradition.",
                images: [
                    "https://images.unsplash.com/photo-1589135398309-11440026e63d?q=80&w=800",
                    "https://images.unsplash.com/photo-1547514711-e556a07f0027?q=80&w=800"
                ],
                collections: [ids.mango].filter(Boolean),
                averageRating: 4.9,
                reviewCount: 342,
                brand: "Anuraga",
                flavor: "Spicy & Sour",
                itemForm: "Pickle",
                ingredients: "Raw Mango, Mustard Powder, Red Chilli Powder, Salt, Fenugreek, Mustard Oil, Asafoetida.",
                storageInstruction: "Store in a cool dry place. Avoid using wet spoons.",
                expertBadges: ["100 Year Old Recipe", "No Added Preservatives"],
                keyBenefits: [{ title: "Gut Health", icon: "Activity" }, { title: "Traditional", icon: "Shield" }],
                variants: [
                    { label: "250g", price: 219, mrp: 299, stock: 150, isDefault: true },
                    { label: "500g", price: 399, mrp: 549, stock: 80 }
                ]
            },
            {
                name: "Sweet & Sour Mango Chutney",
                slug: "sweet-sour-mango-chutney",
                description: "A delightful balance of jaggery sweetness and mango tanginess. Perfect for kids and those who prefer a milder, more versatile pickle that pairs beautifully with parathas and bread.",
                images: ["https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800"],
                collections: [ids.mango].filter(Boolean),
                averageRating: 4.6,
                reviewCount: 128,
                brand: "Anuraga",
                flavor: "Sweet & Tangy",
                ingredients: "Grated Mango, Jaggery, Cinnamon, Cardamom, Cumin, Black Salt.",
                variants: [{ label: "300g", price: 249, mrp: 299, stock: 60, isDefault: true }]
            },

            // 🧄 GARLIC PICKLES
            {
                name: "Royal Garlic Pickle",
                slug: "royal-garlic-pickle",
                description: "Whole peeled garlic cloves slow-cooked in a spicy marinade. This pickle is known for its nutty texture and robust flavor profile. An excellent immunity booster for the whole family.",
                images: ["https://images.unsplash.com/photo-1589135398309-11440026e63d?q=80&w=800"],
                collections: [ids.garlic].filter(Boolean),
                averageRating: 4.8,
                reviewCount: 89,
                brand: "Anuraga",
                flavor: "Robust Garlic",
                itemForm: "Whole Clove Pickle",
                expertBadges: ["Immunity Booster", "Handmade"],
                variants: [
                    { label: "250g", price: 239, mrp: 299, stock: 90, isDefault: true },
                    { label: "500g", price: 449, mrp: 549, stock: 40 }
                ]
            },

            // 🌶️ SPICE POWDERS
            {
                name: "Stone Ground Turmeric Powder",
                slug: "stone-ground-turmeric",
                description: "Highest curcumin content Turmeric sourced from the hills of Meghalaya. Stone-ground at low temperatures to retain natural oils and medicinal properties.",
                images: ["https://images.unsplash.com/photo-1615485290382-441e4d049cb5?q=80&w=800"],
                collections: [ids.spices].filter(Boolean),
                averageRating: 4.9,
                reviewCount: 56,
                brand: "Anuraga",
                itemForm: "Fine Powder",
                ingredients: "100% Organic Turmeric Rhizomes.",
                expertBadges: ["High Curcumin", "Lab Tested"],
                variants: [{ label: "200g", price: 149, mrp: 199, stock: 200, isDefault: true }]
            },
            {
                name: "Aromatic Coriander Powder",
                slug: "aromatic-coriander-powder",
                description: "Dry roasted coriander seeds ground to perfection. Adds a sweet, citrusy aroma to any dish. No fillers, no colors, just pure spice.",
                images: ["https://images.unsplash.com/photo-1532336414038-cf19250c5757?q=80&w=800"],
                collections: [ids.spices].filter(Boolean),
                averageRating: 4.5,
                reviewCount: 34,
                brand: "Anuraga",
                itemForm: "Powder",
                variants: [{ label: "250g", price: 129, mrp: 159, stock: 150, isDefault: true }]
            },

            // 🌾 ORGANIC ATTA
            {
                name: "Premium Stone-Ground Chakki Atta",
                slug: "premium-chakki-atta",
                description: "Whole wheat grain stone-ground to preserve the bran and germ. Makes the softest rotis with high fiber content. Sourced from pesticide-free wheat fields.",
                images: ["https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800"],
                collections: [ids.atta].filter(Boolean),
                averageRating: 4.7,
                reviewCount: 215,
                brand: "Anuraga",
                itemForm: "Flour",
                packagingType: "Eco-friendly Paper Bag",
                expertBadges: ["Stone Ground", "Pesticide Free"],
                variants: [
                    { label: "5kg", price: 349, mrp: 449, stock: 100, isDefault: true },
                    { label: "10kg", price: 649, mrp: 799, stock: 50 }
                ]
            },
            {
                name: "Ancient Grains Multi-grain Atta",
                slug: "ancient-grains-atta",
                description: "A super-blend of Wheat, Ragi, Bajra, Jowar, and Soy. Designed for the health-conscious consumer who refuses to compromise on taste.",
                images: ["https://images.unsplash.com/photo-1627485204223-39d9361a868f?q=80&w=800"],
                collections: [ids.atta].filter(Boolean),
                averageRating: 4.8,
                reviewCount: 67,
                brand: "Anuraga",
                itemForm: "Flour",
                expertBadges: ["Energy Rich", "High Protein"],
                variants: [{ label: "5kg", price: 429, mrp: 499, stock: 80, isDefault: true }]
            },

            // 🎁 COMBOS
            {
                name: "Ultimate South Indian Pickle Combo",
                slug: "ultimate-pickle-combo",
                description: "A curated selection of our top 3 pickles: Mango, Garlic, and Tomato. The perfect starter pack for an authentic South Indian dining experience.",
                images: ["https://images.unsplash.com/photo-1547514711-e556a07f0027?q=80&w=800"],
                collections: [ids.combos, ids.festive].filter(Boolean),
                isCombo: true,
                averageRating: 5.0,
                reviewCount: 45,
                brand: "Anuraga",
                expertBadges: ["Best Value", "Gift Worthy"],
                variants: [{ label: "250g x 3 Jars", price: 599, mrp: 897, stock: 100, isDefault: true }]
            },
            {
                name: "Breakfast Essentials Box",
                slug: "breakfast-essentials-box",
                description: "Includes our Sweet Mango Chutney, Stone-ground Atta (5kg), and Ginger Garlic Paste. Everything you need for a wholesome family breakfast.",
                images: ["https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=800"],
                collections: [ids.combos].filter(Boolean),
                isCombo: true,
                averageRating: 4.9,
                reviewCount: 22,
                brand: "Anuraga",
                variants: [{ label: "Standard Box", price: 849, mrp: 1099, stock: 30, isDefault: true }]
            }
        ];

        await Product.insertMany(products);
        console.log(`🌱 Successfully seeded ${products.length} rich products across all categories.`);

        process.exit(0);
    } catch (error) {
        console.error("❌ Rich product seeding failed");
        console.error(error);
        process.exit(1);
    }
};

seedRichProducts();
