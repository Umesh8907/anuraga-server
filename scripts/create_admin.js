import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../src/modules/users/user.model.js";
import dotenv from "dotenv";

dotenv.config(); // Load env vars

const mongooseLoader = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) throw new Error("MONGODB_URI not found in env");

        await mongoose.connect(uri);
        console.log("✅ MongoDB Connected");
    } catch (error) {
        console.error("❌ MongoDB Connection Failed", error);
        process.exit(1);
    }
};

const createAdmin = async () => {
    await mongooseLoader();

    const phone = "1234567894";
    const password = "Umesh@8907";
    const name = "Admin User";
    const email = "admin@anuraga.com";

    try {
        // Check if user exists
        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            existingUser.role = "ADMIN";
            existingUser.email = email; // Ensure email is set even for existing users
            existingUser.passwordHash = await bcrypt.hash(password, 10);
            await existingUser.save();
            console.log("✅ User updated to ADMIN with new password.");
        } else {
            console.log("Creating new ADMIN user...");
            const passwordHash = await bcrypt.hash(password, 10);
            await User.create({
                phone,
                email,
                name,
                passwordHash,
                role: "ADMIN",
                status: "ACTIVE"
            });
            console.log("✅ Admin user created successfully.");
        }
    } catch (error) {
        console.error("❌ Error creating admin:", error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

createAdmin();
