import type { ErrorRequestHandler } from "express";
import mongoose from "mongoose";
import multer from "multer";

export const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
    if (res.headersSent) {
        next(error);
        return;
    }

    if (error instanceof mongoose.Error.ValidationError || error instanceof mongoose.Error.CastError) {
        res.status(400).json({message: "Invalid submitted data"});
        return;
    }

    if (error instanceof multer.MulterError) {
        const status = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;
        res.status(status).json({message: error.message});
        return;
    }

    if (error instanceof SyntaxError && "status" in error && error.status === 400) {
        res.status(400).json({message: "Invalid JSON"});
        return;
    }

    if (error?.code === 11000) {
        res.status(409).json({message: "Record already exists"});
        return;
    }

    if (error instanceof Error && error.message === "Please upload an MP3 file") {
        res.status(400).json({message: error.message});
        return;
    }

    if (error?.code === "ENOENT" || error?.status === 404) {
        res.status(404).json({message: "Audio file not found"});
        return;
    }

    console.error("Request failed:", error instanceof Error ? error.name : "Unknown error");
    res.status(500).json({message: "An unexpected server error occurred"});
};
