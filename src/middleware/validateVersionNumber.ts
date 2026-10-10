import type { RequestHandler } from "express";

export const validateVersionNumber: RequestHandler = (req, res, next) => {
    const versionNumber = Number(req.params.versionId);

    if (!Number.isSafeInteger(versionNumber) || versionNumber < 1) {
        res.status(400).json({
            message: "Version number must be a positive integer"
        });
        return;
    }

    next();
};