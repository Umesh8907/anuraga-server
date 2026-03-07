import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import limitMiddleware from "../middlewares/rateLimit.middleware.js";

import env from "../config/env.js";

const expressLoader = (app) => {
    // Security headers
    app.use(helmet());

    // Enable gzip compression
    app.use(compression());

    // Rate Limiting
    app.use(limitMiddleware);

    // JSON & URL encoded body parsing
    app.use(express.json({ limit: "10kb" }));
    app.use(express.urlencoded({ extended: true }));

    // Cookies (for JWT in HttpOnly cookies)
    app.use(cookieParser());

    // CORS configuration
    app.use(
        cors({
            origin: env.CLIENT_URL,
            credentials: true
        })
    );

    // HTTP request logging (env-aware)
    if (!env.isTest && env.LOG_LEVEL !== "silent") {
        app.use(morgan(env.LOG_LEVEL));
    }

    return app;
};

export default expressLoader;
