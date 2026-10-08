import { Router } from "express";
import { getVersionById } from "../services/demoVersionService.js";
import { createComment, getCommentsByVersionId } from "../services/commentService.js";

const router = Router();

router.post("/:id/versions/:versionId/comments", async (req, res) => {

    const versionId = Number(req.params.versionId);
    const demoId = req.params.id;

    const version = await getVersionById(demoId, versionId);
    
        if (!version) {
        return res.status(404).json({
            message: "Version not found"
        });
    }

    const { text } = req.body;

    const errors: string[] = [];

    if (typeof text !== "string" || text.trim() === "") {
        errors.push("Comment text must be a non-empty string");
    }

    if (errors.length > 0) {
        return res.status(400).json({
            message: "Comment was not added",
            errors
        });
    }

    const comment = createComment(versionId, text);

    res.status(201).json(comment);
});

router.get("/:id/versions/:versionId/comments", async (req, res) => {

    const versionId = Number(req.params.versionId);
    const demoId = req.params.id;

    const version = await getVersionById(demoId, versionId);

        if (!version) {
            return res.status(404).json({
                message: "Version not found"
            });
        }

    const comments = await getCommentsByVersionId(versionId);

    res.json(comments);
});

export default router;