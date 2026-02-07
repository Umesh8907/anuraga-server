import env from "../config/env.js";

const errorMiddleware = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;

    const response = {
        success: false,
        message: err.message || "Internal Server Error"
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
