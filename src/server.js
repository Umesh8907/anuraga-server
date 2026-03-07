import app from "./app.js";
import dbInitialize from "./config/db.init.js";
import env from "./config/env.js";
import mongooseLoader from "./loaders/mongoose.loader.js";

const startServer = async () => {
    try {
        // Connect to MongoDB
        await mongooseLoader();

        // Initialize database (sync indexes, seed admin/products if empty)
        await dbInitialize();

        // Start HTTP server
        app.listen(env.PORT, () => {
            console.log(
                `🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`
            );
        });
    } catch (error) {
        console.error("❌ Server startup failed");
        console.error(error);
        process.exit(1);
    }
};

startServer();
