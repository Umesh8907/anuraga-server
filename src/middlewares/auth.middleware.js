import jwt from "jsonwebtoken";
import env from "../config/env.js";
import User from "../modules/users/user.model.js";

const authMiddleware = async (req, res, next) => {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const token = header.split(" ")[1];
        const decoded = jwt.verify(token, env.JWT_SECRET);

        console.log("DEBUG: Auth Middleware Decoded:", decoded); // Debug log

        // Verify user exists in DB - Fix for Zombie Tokens
        const user = await User.findById(decoded.userId);
        if (!user) {
            console.log("DEBUG: User not found in DB for token:", decoded.userId);
            return res.status(401).json({ message: "Invalid token: User not found" });
        }

        // Ensure both id and _id are available
        req.user = {
            id: user._id.toString(),
            _id: user._id
        };

        console.log("DEBUG: req.user set to:", req.user); // Debug log

        next();
    } catch (error) {
        console.error("DEBUG: Auth Middleware Error:", error.message);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

export default authMiddleware;
