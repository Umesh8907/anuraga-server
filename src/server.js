import http from "http";
import env from "./config/env.js";
import app from "./app.js";
import mongooseLoader from "./loaders/mongoose.loader.js";
import { initSocket } from "./socket/index.js";

const startServer = async () => {
    try {
        // Connect to MongoDB
        await mongooseLoader();

        // Create HTTP server from Express app
        const httpServer = http.createServer(app);

        // Initialize Socket.io
        initSocket(httpServer);

        // Start HTTP server
        httpServer.listen(env.PORT, () => {
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
