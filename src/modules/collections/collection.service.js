import Collection from "./collection.model.js";
import slugify from "slugify";

const getAllCollections = async () => {
    return Collection.find({ isActive: true }).sort({ createdAt: -1 });
};

const getCollectionBySlug = async (slug) => {
    return Collection.findOne({
        slug,
        isActive: true
    });
};

const createCollection = async (data) => {
    const slug = slugify(data.name, { lower: true });
    return await Collection.create({ ...data, slug });
};

const updateCollection = async (id, data) => {
    if (data.name) {
        data.slug = slugify(data.name, { lower: true });
    }
    return await Collection.findByIdAndUpdate(id, data, { new: true });
};

const deleteCollection = async (id) => {
    return await Collection.findByIdAndDelete(id);
};

export default {
    getAllCollections,
    getCollectionBySlug,
    createCollection,
    updateCollection,
    deleteCollection
};
