import Product from "./product.model.js";
import inventoryService from "../inventory/inventory.service.js";

const getProductBySlug = async (slug) => {
    return Product.findOne({
        slug,
        isActive: true
    }).populate("collections", "name slug");
};

const getProductById = async (id) => {
    return Product.findById(id).populate("collections", "name slug");
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

    // Using a loop to ensure we can log transactions properly
    // This is less efficient than bulkWrite but ensures data integrity for the inventory system
    const results = [];
    for (const item of items) {
        // We technically need the productId to inspect the product.
        // If the frontend doesn't pass productId, we might need to find it by variantId.
        // Assuming the frontend passes productId as well or we find it.
        // Since the current API might just pass variantId, let's look it up.

        const product = await Product.findOne({ "variants._id": item.variantId });
        if (product) {
            const variant = product.variants.id(item.variantId);
            const previousStock = variant.stock;
            variant.stock = item.quantity;
            await product.save();

            // Log as adjustment
            await inventoryService.logTransaction({
                product: product._id,
                variantId: item.variantId,
                variantLabel: variant.label,
                type: "ADJUSTMENT",
                quantity: Math.abs(item.quantity - previousStock), // Log the delta
                previousStock,
                currentStock: item.quantity,
                reason: "Bulk Stock Update",
                performedBy: null // System or Admin (if we had context)
            });
            results.push(product);
        }
    }

    return results;
};

export default {
    getProductBySlug,
    getProductsByCollection,
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    bulkUpdateStock,
    getProductById
};
