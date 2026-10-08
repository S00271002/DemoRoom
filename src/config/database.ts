import mongoose from "mongoose";

export async function connectDatabase(): Promise<void> {
    const uri = process.env.MONGODB_URI;

    console.log("MongoDB URI loaded:", Boolean(uri));

    if (!uri) {
        throw new Error("MONGODB_URI is missing");
    }

    await mongoose.connect(uri);

    console.log("Connected to MongoDB");
}