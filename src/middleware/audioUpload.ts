import multer from "multer";
import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";

const uploadDirectory = path.resolve("uploads");

mkdirSync(uploadDirectory, { recursive: true }); //creates uploads folder if it isnt there 

const storage = multer.diskStorage({
    destination: uploadDirectory,

    filename: (req, file, callback) => {
        callback(null, `${randomUUID()}.mp3`); //allows two demo.mp3 to exist
    }
});

export const audioUpload = multer({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024,
        files: 1
    },

    fileFilter: (req, file, callback) => {
        const extension = path.extname(file.originalname).toLowerCase();

        if (extension !== ".mp3") {
            return callback(new Error("Please upload an MP3 file")); //just mp3 for now
        }

        callback(null, true);
    }
});