import authService from "./auth.service.js";

export const register = async (req, res, next) => {
    try {
        const data = await authService.register(req.body);
        res.status(201).json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

export const login = async (req, res, next) => {
    try {
        const data = await authService.login(req.body);
        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

export const refresh = async (req, res, next) => {
    try {
        const data = await authService.refresh(req.body.refreshToken);
        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

export const logout = async (req, res, next) => {
    try {
        await authService.logout(req.user.id, req.body.refreshToken);
        res.json({ success: true });
    } catch (err) {
        next(err);
    }
};

export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const resetToken = await authService.forgotPassword(email);

        // In production, this would be sent via email.
        // For dev, we return it.
        res.status(200).json({
            success: true,
            message: "Reset token generated",
            resetToken
        });
    } catch (error) {
        next(error);
    }
};

export const resetPassword = async (req, res, next) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const result = await authService.resetPassword(token, password);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};
