import type { RequestHandler } from "express";
import { isObjectIdOrHexString } from "mongoose";

export const validateDemoId: RequestHandler = (req, res, next) => {
    const demoId = req.params.id;

    if (
        typeof demoId !== "string" ||
        !isObjectIdOrHexString(demoId)
    ) {
        res.status(400).json({
            message: "Invalid demo ID"
        });
        return;
    }

    next();
};