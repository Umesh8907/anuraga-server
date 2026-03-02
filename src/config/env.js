import dotenv from "dotenv";

dotenv.config();

function requireEnv(key) {
    if (!process.env[key]) {
        throw new Error(`❌ Missing required environment variable: ${key}`);
    }
    return process.env[key];
}

const env = {
    // App
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: process.env.PORT || 4000,

    // Database
    MONGODB_URI: requireEnv("MONGODB_URI"),

    // Auth
    JWT_SECRET: requireEnv("JWT_SECRET"),
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",

    // Client
    CLIENT_URL: process.env.CLIENT_URL
        ? process.env.CLIENT_URL.split(",").map(url => url.trim())
        : ["http://localhost:3000", "http://127.0.0.1:3000"],

    // Payments (Razorpay placeholder)
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || "",
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || "",

    // SMS
    FAST2SMS_API_KEY: process.env.FAST2SMS_API_KEY || ""
};

export default env;
