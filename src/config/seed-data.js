export const collectionsData = [
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

export const getProductsData = (mangoId, garlicId, spiceId, attaId, comboId) => [
    // 🥭 Mango Pickle
    {
        name: "Homemade Mango Pickle",
        slug: "homemade-mango-pickle",
        description: "Traditional South Indian homemade mango pickle made with organic ingredients.",
        images: [],
        isCombo: false,
        quantityFixed: false,
        collections: [mangoId],
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
        collections: [garlicId],
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
        collections: [spiceId],
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
        collections: [attaId],
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
        collections: [comboId],
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
