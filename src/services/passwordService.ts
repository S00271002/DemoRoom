import * as argon2 from "argon2";

//hashes a password using the argon2 algorithm
export async function hashPassword(password: string): Promise<string> {
    return await argon2.hash(password, {
        type: argon2.argon2id
    });
}

//verifies a password against a hashed password using the argon2 algorithm
export async function verifyPassword(
    passwordHash: string,
    password: string
): Promise<boolean> {
    return await argon2.verify(passwordHash, password);
}