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
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    currentVersionId: {
        type: Schema.Types.ObjectId,
        ref: "DemoVersion",
        default: null
    }
}, { timestamps: true });

export const DemoModel = model("Demo", demoSchema);