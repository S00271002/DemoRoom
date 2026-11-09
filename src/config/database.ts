import mongoose from "mongoose";

export async function connectDatabase(): Promise<void> {
    
    //gets my mongodb connection string from the .env
    const uri = process.env.MONGODB_URI; 

    console.log("MongoDB URI loaded:", Boolean(uri));

    if (!uri) {
        throw new Error("MONGODB_URI is missing");
    }

    await mongoose.connect(uri); //connects to it 

    console.log("Connected to MongoDB");
}