import multer from "multer";
import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";

const uploadDirectory = path.resolve("uploads");

mkdirSync(uploadDirectory, { recursive: true }); //creates uploads folder if it isnt there 

const storage = multer.diskStorage({ //tells multer where to store the uploaded files and what to name them
    destination: uploadDirectory,

    filename: (req, file, callback) => {
        callback(null, `${randomUUID()}.mp3`); //allows two demo.mp3 to exist - helps with version handling 
    }
});

export const audioUpload = multer({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024,
        files: 1
    },
    
    //just allows mp3s to be uploaded for now
    fileFilter: (req, file, callback) => { 
        const extension = path.extname(file.originalname).toLowerCase();

        if (extension !== ".mp3") {
            return callback(new Error("Please upload an MP3 file")); 

            callback(null, true);
        }
    }, 
})