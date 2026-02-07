import mongoose from "mongoose";
import env from "../src/config/env.js";
import User from "../src/modules/users/user.model.js";

const migrateIndexes = async () => {
    try {
        await mongoose.connect(env.MONGODB_URI);
        console.log("✅ MongoDB connected");

        const collection = User.collection;

        // Check existing indexes
        const indexes = await collection.indexes();
        console.log("Existing indexes:", indexes);

        // Drop the old unique phone index if it exists
        // Note: The index name might vary, usually "phone_1"
        const phoneIndex = indexes.find(idx => idx.key.phone === 1 && idx.unique === true);

        if (phoneIndex) {
            console.log(`🗑️ Dropping index: ${phoneIndex.name}`);
            await collection.dropIndex(phoneIndex.name);
        } else {
            console.log("ℹ️ unique phone index not found (maybe already dropped)");
        }

        // The new index is defined in the model, but we can explicitly create it to be sure
        // Mongoose usually handles this on app start, but explicit is good for migration
        await collection.createIndex({ phone: 1, role: 1 }, { unique: true });
        console.log("✅ Created new compound index: { phone: 1, role: 1 }");

        console.log("🎉 Migration complete");
        process.exit(0);
    } catch (error) {
        console.error("❌ Migration failed");
        console.error(error);
        process.exit(1);
    }
};

migrateIndexes();
