import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import env from "../config/env.js";
import User from "../modules/users/user.model.js";

let io;

export const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: env.CLIENT_URL || "http://localhost:3000",
            methods: ["GET", "POST"]
        }
    });

    // Middleware for Authentication
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error("Authentication error: Token missing"));
            }

            // Verify token
            const decoded = jwt.verify(token, env.JWT_SECRET);
            if (!decoded || !decoded.userId) {
                return next(new Error("Authentication error: Invalid token"));
            }

            // Attach user to socket
            const user = await User.findById(decoded.userId).select("name role email");
            if (!user) {
                return next(new Error("Authentication error: User not found"));
            }

            socket.user = user;
            next();
        } catch (err) {
            console.error("Socket Auth Error:", err.message);
            next(new Error("Authentication error"));
        }
    });

    // Connection Handler
    io.on("connection", (socket) => {
        console.log(`Socket connected: ${socket.id} (User: ${socket.user.name})`);

        // Join personal room for targeted notifications
        const userRoom = `user_${socket.user._id.toString()}`;
        socket.join(userRoom);
        console.log(`Socket ${socket.id} joined room: ${userRoom}`);

        // Join Admin room if applicable
        if (socket.user.role === "ADMIN") {
            socket.join("admin_room");
            console.log(`Socket ${socket.id} joined room: admin_room`);
        }

        socket.on("disconnect", () => {
            console.log(`Socket disconnected: ${socket.id}`);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};
