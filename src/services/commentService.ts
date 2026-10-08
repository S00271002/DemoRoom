import type { Comment } from "../models/comment.js";

const comments: Comment[] = [];
let nextCommentId = 1;

export function getCommentsByVersionId(versionId: number): Comment[] {
    return comments.filter(
        (comment) => comment.versionId === versionId
    );
}

export function createComment(versionId: number, text: string): Comment {
    const comment: Comment = {
        id: nextCommentId++,
        versionId,
        userId: 1, //users.current?.id || 1,
        text: text.trim(),
        createdAt: new Date().toISOString()
    };

    comments.push(comment);
    return comment;
}