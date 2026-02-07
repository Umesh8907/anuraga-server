import connectDB from "../config/database.js";

const mongooseLoader = async () => {
    await connectDB();
};

export default mongooseLoader;
