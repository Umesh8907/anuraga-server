import jwt from "jsonwebtoken";
import env from "../config/env.js";

const authMiddleware = (req, res, next) => {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const token = header.split(" ")[1];
        const decoded = jwt.verify(token, env.JWT_SECRET);
        req.user = { id: decoded.userId };
        next();
    } catch {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

export default authMiddleware;
