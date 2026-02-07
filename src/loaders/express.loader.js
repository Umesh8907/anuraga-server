import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import env from "../config/env.js";

const expressLoader = (app) => {
    // Security headers
    app.use(helmet());

    // Enable gzip compression
    app.use(compression());

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

    // HTTP request logging
    if (env.NODE_ENV === "development") {
        app.use(morgan("dev"));
    }

    return app;
};

export default expressLoader;
