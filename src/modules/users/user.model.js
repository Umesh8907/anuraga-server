import mongoose from "mongoose";

/* ---------- Address (embedded) ---------- */
const addressSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        phone: { type: String, required: true },

        addressLine1: { type: String, required: true },
        addressLine2: { type: String },

        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },

        isDefault: { type: Boolean, default: false }
    },
    { _id: true }
);

/* ---------- Refresh Token (embedded) ---------- */
const refreshTokenSchema = new mongoose.Schema(
    {
        tokenHash: { type: String, required: true },
        expiresAt: { type: Date, required: true },
        createdAt: { type: Date, default: Date.now }
    },
    { _id: true }
);

/* ---------- User ---------- */
const userSchema = new mongoose.Schema(
    {
        phone: {
            type: String,
            required: true,
            unique: true,
            index: true
        },

        passwordHash: {
            type: String,
            required: true
        },

        name: {
            type: String
        },

        role: {
            type: String,
            enum: ["USER", "ADMIN"],
            default: "USER"
        },

        status: {
            type: String,
            enum: ["ACTIVE", "BLOCKED"],
            default: "ACTIVE"
        },

        addresses: [addressSchema],

        refreshTokens: [refreshTokenSchema]
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
