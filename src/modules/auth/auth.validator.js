// src/modules/auth/auth.validation.js

export const validateRegister = (req, res, next) => {
    const { phone, password } = req.body;

    if (!phone || !password) {
        return res.status(400).json({
            success: false,
            message: "Phone and password are required",
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
