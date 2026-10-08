import { Schema, model } from "mongoose";

const demoSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    tempo: {
        type: Number,
        min: 1
    },
    key: {
        type: String,
        trim: true
    }
});

export const DemoModel = model("Demo", demoSchema);