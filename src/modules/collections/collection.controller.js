import collectionService from "./collection.service.js";

export const getCollections = async (req, res, next) => {
    try {
        const collections = await collectionService.getAllCollections();

        res.status(200).json({
            success: true,
            data: collections
        });
    } catch (error) {
        next(error);
    }
};

export const getCollectionBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;

        const collection = await collectionService.getCollectionBySlug(slug);

        if (!collection) {
            return res.status(404).json({
                success: false,
                message: "Collection not found"
            });
        }

        res.status(200).json({
            success: true,
            data: collection
        });
    } catch (error) {
        next(error);
    }
};

export const createCollection = async (req, res, next) => {
    try {
        const collection = await collectionService.createCollection(req.body);
        res.status(201).json({
            success: true,
            data: collection
        });
    } catch (error) {
        next(error);
    }
};

export const updateCollection = async (req, res, next) => {
    try {
        const { id } = req.params;
        const collection = await collectionService.updateCollection(id, req.body);
        if (!collection) {
            return res.status(404).json({
                success: false,
                message: "Collection not found"
            });
        }
        res.status(200).json({
            success: true,
            data: collection
        });
    } catch (error) {
        next(error);
    }
};

export const deleteCollection = async (req, res, next) => {
    try {
        const { id } = req.params;
        await collectionService.deleteCollection(id);
        res.status(200).json({
            success: true,
            message: "Collection deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};
