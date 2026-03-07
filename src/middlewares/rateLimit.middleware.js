import rateLimit from "express-rate-limit";
import env from "../config/env.js";

const limiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    standardHeaders: true,  // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false,   // Disable the `X-RateLimit-*` headers
    // In test mode, skip rate limiting entirely
    skip: () => env.isTest,
    message: {
        success: false,
        message: "Too many requests from this IP, please try again later"
    }
});

export default limiter;
