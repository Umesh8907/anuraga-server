import mongoose from "mongoose";
import initializeDatabase from "../src/config/db.init.js";
import env from "../src/config/env.js";

const runMigration = async () => {
    try {
        await mongoose.connect(env.MONGODB_URI);
        console.log("✅ MongoDB connected for migration");

        // Runs the same init script as server boot
        await initializeDatabase();
        
        console.log("🎉 Migration script finished successfully.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Migration failed");
        console.error(error);
        process.exit(1);
    }
};

runMigration();
