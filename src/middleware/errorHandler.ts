import type { ErrorRequestHandler } from "express";
import mongoose from "mongoose";

export const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
    if (res.headersSent) {
        next(error);
        return;
    }

    console.error(
        "Request failed:",
        error instanceof Error ? error.name : "Unknown error"
    );

    if (error instanceof mongoose.Error.ValidationError) {
    for (const fieldError of Object.values(error.errors)) {
        console.error(
            "Invalid field:",
            fieldError.path,
            "Reason:",
            fieldError.kind
        );
    }
}

    res.status(500).json({
        message: "An unexpected server error occurred"
    });
};