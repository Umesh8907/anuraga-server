import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../../");

/**
 * Load environment variables from .env.<NODE_ENV> if it exists,
 * otherwise fall back to .env (for backward compatibility).
 *
 * Priority (highest → lowest):
 *   1. Existing process.env variables (e.g. set by Docker / CI)
 *   2. .env.<NODE_ENV>   (e.g. .env.local, .env.dev, .env.test, .env.prod)
 *   3. .env              (generic fallback)
 */
const envFile = `.env.${process.env.NODE_ENV}`;
const envPath = path.join(ROOT, envFile);
const fallback = path.join(ROOT, ".env");

// Load env-specific file first; don't override vars already set in process.env
const result = dotenv.config({ path: envPath, override: false });
if (result.error) {
    // Fall back to the generic .env
    dotenv.config({ path: fallback, override: false });
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function requireEnv(key) {
    if (!process.env[key]) {
        throw new Error(`❌ Missing required environment variable: ${key}`);
    }
    return process.env[key];
}

function optionalInt(key, defaultValue) {
    const val = process.env[key];
    const parsed = parseInt(val, 10);
    return Number.isNaN(parsed) ? defaultValue : parsed;
}

// ─────────────────────────────────────────────────────────────
// Resolved config object — import this everywhere instead of
// touching process.env directly.
// ─────────────────────────────────────────────────────────────
const env = {
    // ── App ───────────────────────────────────────────────────
    NODE_ENV: process.env.NODE_ENV || "local",
    APP_NAME: process.env.APP_NAME || "anuraga-server",
    PORT: optionalInt("PORT", 4000),

    // ── Database ──────────────────────────────────────────────
    MONGODB_URI: requireEnv("MONGODB_URI"),

    // ── Auth ──────────────────────────────────────────────────
    JWT_SECRET: requireEnv("JWT_SECRET"),
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",

    // ── CORS ──────────────────────────────────────────────────
    CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",

    // ── Payments ──────────────────────────────────────────────
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || "",
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || "",

    // ── Admin Seed ────────────────────────────────────────────
    // Used once on first boot to create the default super-admin.
    // Leave blank to skip seeding (or when injecting via CI/CD).
    ADMIN_PHONE: process.env.ADMIN_PHONE || "",
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "",

    // ── Logging ───────────────────────────────────────────────
    // Accepted: dev | combined | silent
    LOG_LEVEL: process.env.LOG_LEVEL || "dev",

    // ── Rate Limiting ─────────────────────────────────────────
    RATE_LIMIT_WINDOW_MS: optionalInt("RATE_LIMIT_WINDOW_MS", 900_000), // 15 min
    RATE_LIMIT_MAX: optionalInt("RATE_LIMIT_MAX", 100),

    // ── Derived helpers ───────────────────────────────────────
    get isProduction() {
        return this.NODE_ENV === "production";
    },
    get isDevelopment() {
        return this.NODE_ENV === "local" || this.NODE_ENV === "dev";
    },
    get isTest() {
        return this.NODE_ENV === "test";
    }
};

export default env;
