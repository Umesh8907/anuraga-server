import productService from "./product.service.js";
import Collection from "../collections/collection.model.js";

export const getProductBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;

        const product = await productService.getProductBySlug(slug);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        next(error);
    }
};

export const getProductsByCollectionSlug = async (req, res, next) => {
    try {
        const { slug } = req.params;

        const collection = await Collection.findOne({
            slug,
            isActive: true
        });

        if (!collection) {
            return res.status(404).json({
                success: false,
                message: "Collection not found"
            });
        }

        const products = await productService.getProductsByCollection(
            collection._id
        );

        res.status(200).json({
            success: true,
            collection: {
                name: collection.name,
                slug: collection.slug
            },
            data: products
        });
    } catch (error) {
        next(error);
    }
};

export const getAllProducts = async (req, res, next) => {
    try {
        const products = await productService.getAllProducts();

        res.status(200).json({
            success: true,
            data: products
        });
    } catch (error) {
        next(error);
    }
};

export const createProduct = async (req, res, next) => {
    try {
        const product = await productService.createProduct(req.body);
        res.status(201).json({
            success: true,
            data: product
        });
    } catch (error) {
        next(error);
    }
};

export const updateProduct = async (req, res, next) => {
    try {
        const product = await productService.updateProduct(req.params.id, req.body);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }
        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        next(error);
    }
};

export const deleteProduct = async (req, res, next) => {
    try {
        const product = await productService.deleteProduct(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

export const searchProducts = async (req, res, next) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({
                success: false,
                message: "Search query 'q' is required"
            });
        }
        const products = await productService.searchProducts(q);
        res.status(200).json({
            success: true,
            data: products
        });
    } catch (error) {
        next(error);
    }
};
