import { Schema, model } from "mongoose";

const commentSchema = new Schema({
    id: {
        type: Schema.Types.ObjectId,
        ref: "Comment",
        required: true
    },
    versionId: {
        type: Schema.Types.ObjectId,
        ref: "DemoVersion",
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    text: {
        type: String,
        required: true,
        trim: true
    }

}, { timestamps: true });

export const CommentModel = model("Comment", commentSchema);