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

const getAllProducts = async () => {
    return Product.find({ isActive: true });
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

export default {
    getProductBySlug,
    getProductsByCollection,
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts
};
