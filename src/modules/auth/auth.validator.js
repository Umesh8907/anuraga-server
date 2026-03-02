// src/modules/auth/auth.validation.js

export const validateRegister = (req, res, next) => {
    const { phone, email, password } = req.body;

    if (!phone || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Phone, email and password are required",
        });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: "Invalid email address",
        });
    }

    // Indian 10-digit phone validation
    if (!/^\d{10}$/.test(phone)) {
        return res.status(400).json({
            success: false,
            message: "Invalid phone number",
        });
    }

    if (typeof password !== "string" || password.length < 6) {
        return res.status(400).json({
            success: false,
            message: "Password must be at least 6 characters long",
        });
    }

    next();
};

export const validateLogin = (req, res, next) => {
    const { phone, password } = req.body;

    if (!phone || !password) {
        return res.status(400).json({
            success: false,
            message: "Phone and password are required",
        });
    }

    if (!/^\d{10}$/.test(phone)) {
        return res.status(400).json({
            success: false,
            message: "Invalid phone number",
        });
    }

    next();
};

export const validateRefresh = (req, res, next) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({
            success: false,
            message: "Refresh token is required",
        });
    }

    next();
};

export const validateRequestOTP = (req, res, next) => {
    const { phone } = req.body;

    if (!phone || !/^\d{10}$/.test(phone)) {
        return res.status(400).json({
            success: false,
            message: "A valid 10-digit phone number is required",
        });
    }

    next();
};

export const validateVerifyOTP = (req, res, next) => {
    const { phone, otp } = req.body;

    if (!phone || !/^\d{10}$/.test(phone)) {
        return res.status(400).json({
            success: false,
            message: "A valid 10-digit phone number is required",
        });
    }

    if (!otp || !/^\d{6}$/.test(otp)) {
        return res.status(400).json({
            success: false,
            message: "A valid 6-digit OTP is required",
        });
    }

    next();
};
