import { CommentModel } from "../models/commentModel.js";

export async function getCommentsByVersionId(versionId: string) {
    return await CommentModel.find({ versionId });
}

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