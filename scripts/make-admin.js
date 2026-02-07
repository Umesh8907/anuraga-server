import mongoose from "mongoose";
import env from "../src/config/env.js";
import User from "../src/modules/users/user.model.js";

const makeAdmin = async (phone) => {
    try {
        if (!phone) {
            console.error("❌ Please provide a phone number: node scripts/make-admin.js <phone>");
            process.exit(1);
        }

        await mongoose.connect(env.MONGODB_URI);
        console.log("✅ MongoDB connected");

        const user = await User.findOne({ phone });

        if (!user) {
            console.error(`❌ User with phone ${phone} not found`);
            process.exit(1);
        }

        user.role = "ADMIN";
        await user.save();

        console.log(`🚀 Success! User ${user.name} (${phone}) is now an ADMIN.`);
        process.exit(0);
    } catch (error) {
        console.error("❌ Operation failed");
        console.error(error);
        process.exit(1);
    }
};

const phoneArg = process.argv[2];
makeAdmin(phoneArg);
