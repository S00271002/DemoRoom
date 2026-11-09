import { CommentModel } from "../models/commentModel.js";

//gets all comments for a specific version of a demo
export async function getCommentsByVersionId(versionId: string) {
    return await CommentModel.find({ versionId });
}

//gets a specific comment by its ID
export async function getCommentById(commentId: string) {
    return await CommentModel.findById(commentId);
}

//creates a new comment for a specific version of a demo
export async function createComment(
    versionId: string,
    userId: string,
    text: string
) {
    return await CommentModel.create({
        versionId,
        userId,
        text: text.trim()
    });
}