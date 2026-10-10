import { Router } from "express";
import { createUser, getUserByEmail } from "../services/userService.js";
import { verifyPassword } from "../services/passwordService.js";
import {getUserForLogin} from "../services/userService.js";

const router = Router();

router.post("/register", async (req, res) => {
    const { username, email, password } = req.body ?? {};

    if (typeof username !== "string" || username.trim() === "") {
        return res.status(400).json({
            message: "A username is required"
        });
    }

    if (
        typeof email !== "string" ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
        return res.status(400).json({
            message: "A valid email is required"
        });
    }

    if (typeof password !== "string" || password.length < 15) {
        return res.status(400).json({
            message: "Password must contain at least 15 characters"
        });
    }

    const existingUser = await getUserByEmail(email);

    if (existingUser) {
        return res.status(409).json({
            message: "Email is already registered"
        });
    }

    const user = await createUser(username, email, password);

    res.status(201).json(user);
});

export default router;


router.post("/login", async (req, res) => {
    const { email, password } = req.body ?? {};

    if (
        typeof email !== "string" ||
        email.trim() === "" ||
        typeof password !== "string" ||
        password === ""
    ) {
        return res.status(400).json({
            message: "Email and password are required"
        });
    }

    const user = await getUserForLogin(email);

    if (!user) {
        return res.status(401).json({
            message: "Invalid email or password"
        });
    }

    const passwordMatches = await verifyPassword(
        user.passwordHash,
        password
    );

    if (!passwordMatches) {
        return res.status(401).json({
            message: "Invalid email or password"
        });
    }

    res.json({
        id: user._id.toString(),
        username: user.username,
        email: user.email
    });
});