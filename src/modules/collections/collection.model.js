import mongoose from "mongoose";

const collectionSchema = new mongoose.Schema(
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
        bannerImage: {
            type: String
        },
        isActive: {
            type: Boolean,
            default: true
        },
        seo: {
            title: String,
            description: String
        }
    },
    { timestamps: true }
);



const Collection = mongoose.model("Collection", collectionSchema);

export default Collection;
