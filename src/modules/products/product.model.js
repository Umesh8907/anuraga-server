import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
    {
        label: {
            type: String,
            required: true // "250g", "500g", "200g x 2"
        },
        price: {
            type: Number,
            required: true
        },
        mrp: {
            type: Number
        },
        stock: {
            type: Number,
            default: 0
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
        }
    },
    { timestamps: true }
);


productSchema.index({ collections: 1 });

const Product = mongoose.model("Product", productSchema);

export default Product;
