import type { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
    if (res.headersSent) {
        next(error);
        return;
    }

    console.error(
        "Request failed:",
        error instanceof Error ? error.name : "Unknown error"
    );

    res.status(500).json({
        message: "An unexpected server error occurred"
    });
};