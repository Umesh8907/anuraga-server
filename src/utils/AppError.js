class AppError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true; // Distinguish operational errors from programming bugs
        Error.captureStackTrace(this, this.constructor);
    }
}

export default AppError;
