import { Router } from "express";
import {createBand, getBandsByUserId} from "../services/bandService.js";

const router = Router({ mergeParams: true });

router.post("/", async (req, res) => {

    const { name } = req.body ?? {};

    if (typeof name !== "string" || name.trim() === "") {
        return res.status(400).json({
            message: "Band name must be a non-empty string"
        });
    }

    const userId = process.env.DEV_USER_ID;

    if (!userId) {
        return res.status(500).json({
            message: "Development user is not configured"
        });
    }

    const band = await createBand(name, userId);

    res.status(201).json(band);
});

router.get("/", async (req, res) => {
    const userId = process.env.DEV_USER_ID;

    if (!userId) {
        return res.status(500).json({
            message: "Development user is not configured"
        });
    }

    const bands = await getBandsByUserId(userId);

    res.json(bands);
});

export default router;