import { Schema, model } from "mongoose";

const bandSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    ownerId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    memberIds: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }]
}, { timestamps: true });

export const BandModel = model("Band", bandSchema);