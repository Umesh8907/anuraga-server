import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
    {
        label: {
            type: String,
            required: true // "250g", "500g", "200g x 2" -> This is effectively 'unit'
        },
        type: {
            type: String,
            enum: ['SIZE', 'COMBO'],
            default: 'SIZE'
        },
        unit: {
            type: String,
            // required: true // Can enable this after migration or if label covers it
        },
        price: {
            type: Number,
            required: true
        },
        discount: {
            type: Number,
            default: 0
        },
        mrp: {
            type: Number
        },
        stock: {
            type: Number,
            default: 0
        },
        realStock: {
            type: Number,
            default: 0
        },
        inStock: {
            type: Number,
            default: 0
        },
        assigned: {
            type: Number,
            default: 0
        },
        ordered: {
            type: Number,
            default: 0
        },
        pricePer100g: {
            type: Number,
        },
        isDefault: {
            type: Boolean,
            default: false
        }
    },
    { _id: true }
);

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },
        description: {
            type: String
        },
        images: [String],

        type: {
            type: String
        },
        brand: {
            type: String
        },
        flavor: {
            type: String
        },
        itemForm: {
            type: String
        },
        ingredients: {
            type: String
        },
        nutritionInformation: {
            type: String
        },
        packagingType: {
            type: String
        },
        storageInstruction: {
            type: String
        },
        dietaryPreference: {
            type: String
        },
        isDeliverableEverywhere: {
            type: Boolean,
            default: true
        },
        availableLocations: [String], // These will be treated as pincodes
        tags: [String],


        isCombo: {
            type: Boolean,
            default: false
        },
        quantityFixed: {
            type: Boolean,
            default: false // true for combos
        },

        collections: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Collection"
            }
        ],

        variants: {
            type: [variantSchema],
            validate: v => v.length > 0
        },

        isActive: {
            type: Boolean,
            default: true
        },

        averageRating: {
            type: Number,
            default: 0
        },
        reviewCount: {
            type: Number,
            default: 0
        },

        keyBenefits: [
            {
                title: String,
                icon: String // store icon name or url
            }
        ],

        keyIngredients: [
            {
                name: String,
                image: String,
                description: String
            }
        ],

        expertBadges: [String], // "Researched by Experts", "Ayurvedic"

        relatedProducts: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product"
            }
        ],

        frequentlyBoughtTogether: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product"
            }
        ],

        // SEO Fields
        metaTitle: {
            type: String,
            trim: true
        },
        metaDescription: {
            type: String,
            trim: true
        },
        keywords: [String],

        // Audit Fields
        lastUpdatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    { timestamps: true }
);


productSchema.index({ collections: 1 });

const Product = mongoose.model("Product", productSchema);

export default Product;
