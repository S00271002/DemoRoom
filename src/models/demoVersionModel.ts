import { Schema, model } from "mongoose";

const demoVersionSchema = new Schema({
    demoId: {
        type: Schema.Types.ObjectId,
        ref: "Demo",
        required: true
    },
    versionNumber: {
        type: Number,
        required: true,
        min: 1
    },
    audioPath: {
        type: String,
        required: true,
        trim: true
    },
    changeNote: {
        type: String,
        required: true,
        trim: true
    }

}, { timestamps: true });

export const DemoVersionModel = model("DemoVersion", demoVersionSchema);