import dotenv from "dotenv";
import fs from "fs";
import path from "path";

const nodeEnv = process.env.NODE_ENV || "development";

// Load environment-specific file first
const envPath = path.resolve(process.cwd(), `.env.${nodeEnv}`);
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
}

// Fallback to default .env for any missing values
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

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
    RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || "",

    // SMS
    FAST2SMS_API_KEY: process.env.FAST2SMS_API_KEY || "",
    FAST2SMS_SENDER_ID: process.env.FAST2SMS_SENDER_ID || "GHRSIN",

    // Mail (SMTP)
    SMTP_HOST: process.env.SMTP_HOST || "",
    SMTP_PORT: parseInt(process.env.SMTP_PORT || "587"),
    SMTP_USER: process.env.SMTP_USER || "",
    SMTP_PASS: process.env.SMTP_PASS || "",
    SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL || "no-reply@anuragapickles.com",
    SMTP_FROM_NAME: process.env.SMTP_FROM_NAME || "Anuraga Pickles"
};

export default env;
