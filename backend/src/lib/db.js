import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async () => {
  try {
    const { MONGO_URI } = process.env;
    if (!MONGO_URI) {
      throw new Error("MONGO_URI is not defined");
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // timeout after 5s instead of 30s
      family: 4, // force IPv4
    });
    console.log("Connected to MongoDB", conn.connection.host);
  } catch (error) {
    console.error("Error connecting to MongoDB is:", error);
    process.exit(1); // 1 status code for failure, 0 for success
  }
};
