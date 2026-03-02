import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../users/user.model.js";
import OTP from "../users/otp.model.js";
import env from "../../config/env.js";
import AppError from "../../utils/AppError.js";
import smsUtils from "../../utils/sms.utils.js";

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_DAYS = 30;

/* ---------- helpers ---------- */

const generateAccessToken = (userId) =>
    jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_TTL });

const generateRefreshToken = () => {
    const token = crypto.randomBytes(40).toString("hex");
    return {
        raw: token,
        hash: bcrypt.hashSync(token, 10),
        expiresAt: new Date(
            Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000
        )
    };
};

/* ---------- core ---------- */

const register = async ({ phone, email, password, name, role = "USER" }) => {
    // Check if phone or email already exists
    const existingUser = await User.findOne({
        $or: [{ phone }, { email }]
    });

    if (existingUser) {
        if (existingUser.phone === phone) {
            throw new AppError(400, `Phone already registered`);
        }
        if (existingUser.email === email) {
            throw new AppError(400, `Email already registered`);
        }
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
        phone,
        email,
        passwordHash,
        name,
        role
    });

    return issueTokens(user);
};

const login = async ({ phone, password, role = "USER" }) => {
    // Find user by phone only first
    const user = await User.findOne({ phone });
    if (!user) throw new AppError(401, "Invalid credentials");

    // Verify Password
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) throw new AppError(401, "Invalid credentials");

    // Role Logic: 
    // If requesting ADMIN login, user MUST be ADMIN.
    if (role === "ADMIN" && user.role !== "ADMIN") {
        throw new AppError(403, "Access denied: Admins only");
    }
    // If requesting USER login (default store login), allow ALL roles (Admins can shop/test too).
    // so we don't throw if user.role is ADMIN but requested role is USER.


    return issueTokens(user);
};

const issueTokens = async (user) => {
    const accessToken = generateAccessToken(user._id);
    const refresh = generateRefreshToken();

    user.refreshTokens.push({
        tokenHash: refresh.hash,
        expiresAt: refresh.expiresAt
    });

    await user.save();

    return {
        accessToken,
        refreshToken: refresh.raw,
        user: {
            id: user._id,
            phone: user.phone,
            name: user.name,
            role: user.role
        }
    };
};

/* ---------- OTP Flow ---------- */

const requestOTP = async (phone) => {
    // 1. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Save to DB (or update if exists)
    await OTP.findOneAndUpdate(
        { phone },
        { otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
        { upsert: true, new: true }
    );

    // 3. Send SMS
    const smsResult = await smsUtils.sendOtpSms(phone, otp);

    // In dev, we might want to see the OTP even if SMS fails or isn't configured
    if (!smsResult.success && env.NODE_ENV === 'production') {
        throw new AppError(500, "Failed to send OTP. Please try again later.");
    }

    return {
        success: true,
        message: "OTP sent successfully",
        otp: env.NODE_ENV === 'development' ? otp : undefined
    };
};

const verifyOTP = async (phone, otp) => {
    // 1. Verify OTP
    const otpDoc = await OTP.findOne({ phone, otp });

    if (!otpDoc) {
        throw new AppError(400, "Invalid or expired OTP");
    }

    // 2. Delete OTP after verification
    await OTP.deleteOne({ _id: otpDoc._id });

    // 3. Find or Create User
    let user = await User.findOne({ phone });

    if (!user) {
        // Create new user if not exists
        user = await User.create({
            phone,
            role: "USER"
        });
    }

    // 4. Issue Tokens
    return issueTokens(user);
};


const refresh = async (refreshToken) => {
    const users = await User.find({
        "refreshTokens.expiresAt": { $gt: new Date() }
    });

    for (const user of users) {
        const tokenDoc = user.refreshTokens.find(rt =>
            bcrypt.compareSync(refreshToken, rt.tokenHash)
        );

        if (tokenDoc) {
            // rotate
            user.refreshTokens.pull(tokenDoc);

            const next = generateRefreshToken();
            user.refreshTokens.push({
                tokenHash: next.hash,
                expiresAt: next.expiresAt
            });

            await user.save();

            return {
                accessToken: generateAccessToken(user._id),
                refreshToken: next.raw
            };
        }
    }

    throw new AppError(401, "Invalid refresh token");
};

const logout = async (userId, refreshToken) => {
    const user = await User.findById(userId);
    if (!user) return;

    user.refreshTokens = user.refreshTokens.filter(
        rt => !bcrypt.compareSync(refreshToken, rt.tokenHash)
    );

    await user.save();
};



const forgotPassword = async (email) => {
    const user = await User.findOne({ email }); // Changed from phone to email for password reset
    if (!user) {
        // for security, maybe don't reveal user existence, but for now throwing error
        throw new AppError(404, "No user found with this email");
    }

    // Generate token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    // Set expire time (1 hour)
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000;

    await user.save();

    return resetToken;
};

const resetPassword = async (resetToken, newPassword) => {
    // Get hashed token
    const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        throw new AppError(400, "Invalid or expired token");
    }

    // Set new password
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt); // Note: using passwordHash as per User model

    // Clear reset fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return { message: "Password updated successfully" };
};

export default {
    requestOTP,
    verifyOTP,
    register,
    login,
    refresh,
    logout,
    forgotPassword,
    resetPassword
};
