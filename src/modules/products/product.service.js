import Product from "./product.model.js";

const getProductBySlug = async (slug) => {
    return Product.findOne({
        slug,
        isActive: true
    }).populate("collections", "name slug");
};

const getProductsByCollection = async (collectionId) => {
    return Product.find({
        collections: collectionId,
        isActive: true
    });
};

import slugify from "slugify";

const getAllProducts = async (query = {}) => {
    const {
        page = 1,
        limit = 10,
        sort,
        minPrice,
        maxPrice,
        collection,
        search,
        inStock
    } = query;

    const filter = { isActive: true };

    // Price Filter
    if (minPrice || maxPrice) {
        filter["variants.price"] = {};
        if (minPrice) filter["variants.price"].$gte = Number(minPrice);
        if (maxPrice) filter["variants.price"].$lte = Number(maxPrice);
    }

    // Collection Filter
    if (collection) {
        filter.collections = collection;
    }

    // Search Filter
    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } }
        ];
    }

    // Stock Filter
    if (inStock === "true") {
        filter["variants.stock"] = { $gt: 0 };
    } else if (inStock === "false") {
        filter["variants.stock"] = { $lte: 0 };
    }

    // Sort
    let sortOption = { createdAt: -1 };
    if (sort === "price_asc") sortOption = { "variants.price": 1 };
    if (sort === "price_desc") sortOption = { "variants.price": -1 };
    if (sort === "name_asc") sortOption = { name: 1 };
    if (sort === "name_desc") sortOption = { name: -1 };

    const products = await Product.find(filter)
        .populate("collections", "name slug")
        .sort(sortOption)
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const count = await Product.countDocuments(filter);

    return {
        products,
        pagination: {
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            limit: Number(limit)
        }
    };
};

const createProduct = async (productData) => {
    const slug = slugify(productData.name, { lower: true });
    const product = new Product({
        ...productData,
        slug
    });
    return await product.save();
};

const updateProduct = async (id, productData) => {
    if (productData.name) {
        productData.slug = slugify(productData.name, { lower: true });
    }
    return await Product.findByIdAndUpdate(id, productData, { new: true });
};

const deleteProduct = async (id) => {
    return await Product.findByIdAndDelete(id);
};

const searchProducts = async (query) => {
    const searchRegex = new RegExp(query, "i");
    return await Product.find({
        $or: [{ name: searchRegex }, { description: searchRegex }],
        isActive: true
    });
};

const bulkUpdateStock = async (items) => {
    if (!items || !Array.isArray(items) || items.length === 0) {
        throw new Error("Invalid items array");
    }

    const operations = items.map(item => ({
        updateOne: {
            filter: { "variants._id": item.variantId },
            update: { $set: { "variants.$.stock": item.quantity } }
        }
    }));

    return await Product.bulkWrite(operations);
};

export default {
    getProductBySlug,
    getProductsByCollection,
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    bulkUpdateStock
};
