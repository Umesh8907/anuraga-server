import express from "express";

import expressLoader from "./loaders/express.loader.js";
import routes from "./routes.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import { swaggerDocs } from "./config/swagger.js";

const app = express();

// Load Express middlewares
// Load Express middlewares
expressLoader(app);

// Swagger Documentation
swaggerDocs(app, process.env.PORT || 4000);

// API routes
app.use("/api", routes);

// Health check (for uptime / load balancers)
app.get("/health", (req, res) => {
    res.status(200).json({ status: "OK" });
});

// Global error handler (must be last)
app.use(errorMiddleware);

export default app;
