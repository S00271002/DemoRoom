import "dotenv/config";
import mongoose from "mongoose";
import { connectDatabase } from "../config/database.js";
import { UserModel } from "../models/userModel.js";
import { hashPassword } from "../services/passwordService.js";

async function createDevUser(): Promise<void> {
    const email = process.env.DEV_USER_EMAIL?.trim().toLowerCase();
    const password = process.env.DEV_USER_PASSWORD;

    if (!email || !password) {
        throw new Error("Development account details are missing");
    }

    await connectDatabase();

    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
        console.log("Development user already exists. ID:", existingUser._id);
        return;
    }

    const passwordHash = await hashPassword(password);

    const user = await UserModel.create({
        username: "DemoRoom Developer",
        email,
        passwordHash
    });

    console.log("Development user created. ID:", user._id);
}

try {
    await createDevUser();
} catch {
    console.error("Could not create the development user.");
    process.exitCode = 1;
} finally {
    await mongoose.disconnect();
}