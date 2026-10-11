import { registrationSchema, loginSchema } from "../validation/demoSchemas.js";
import { Router } from "express";
import { createUser, getUserByEmail, getUserForLogin } from "../services/userService.js";
import { verifyPassword } from "../services/passwordService.js";

const router = Router({ mergeParams: true });

router.post("/register", async (req, res) => {
    const result = registrationSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            message: "Invalid registration",
            errors: result.error.issues
        });
    }

    const { username, email, password } = result.data;
    const existingUser = await getUserByEmail(email);

    if (existingUser) {
        return res.status(409).json({
            message: "Email is already registered"
        });
    }

    const user = await createUser(username, email, password);
    res.status(201).json(user);
});

router.post("/login", async (req, res) => {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            message: "Email and password are required",
            errors: result.error.issues
        });
    }

    const { email, password } = result.data;
    const user = await getUserForLogin(email);

    if (!user) {
        return res.status(401).json({
            message: "Invalid email or password"
        });
    }

    const passwordMatches = await verifyPassword(user.passwordHash, password);

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

export default router;
