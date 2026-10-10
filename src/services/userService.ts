import { UserModel } from "../models/userModel.js";
import { hashPassword } from "./passwordService.js";

export async function getUserByEmail(email: string) {
    return await UserModel.findOne({
        email: email.trim().toLowerCase()
    }).exec();
}

export async function getUserForLogin(email: string) {
    return await UserModel.findOne({
        email: email.trim().toLowerCase()
    }).select("+passwordHash");
}

export async function createUser(username: string, email: string, password: string) {
    const passwordHash = await hashPassword(password);

    const user = await UserModel.create({
        username: username.trim(),
        email: email.trim().toLowerCase(),
        passwordHash
    });

    return {
        id: user._id.toString(),
        username: user.username,
        email: user.email
    };
}



