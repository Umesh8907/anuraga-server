import env from "../config/env.js";
import AppError from "../utils/AppError.js";

const errorMiddleware = (err, req, res, _next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    if (!(err instanceof AppError) && env.NODE_ENV === "production") {
        statusCode = 500;
        message = "Something went wrong"; // Hide internal details in production
    }

    const response = {
        success: false,
        message
    };

    // Include stack trace only in development
    if (env.NODE_ENV === "development") {
        response.stack = err.stack;
    }

    // Log error (later you can replace with Winston / external logger)
    console.error("❌ Error:", {
        message: err.message,
        statusCode,
        path: req.originalUrl,
        method: req.method
    });

    res.status(statusCode).json(response);
};

export default errorMiddleware;
