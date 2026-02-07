import mongoose from "mongoose";
import env from "./env.js";

const connectDB = async () => {
    try {
        mongoose.set("strictQuery", true);

        const conn = await mongoose.connect(env.MONGODB_URI, {
            autoIndex: env.NODE_ENV === "development"
        });

        console.log(
            `✅ MongoDB connected: ${conn.connection.host}/${conn.connection.name}`
        );
    } catch (error) {
        console.error("❌ MongoDB connection failed");
        console.error(error.message);
        process.exit(1);
    }
};

export default connectDB;
