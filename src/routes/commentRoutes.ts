import { Router } from "express";
import { getVersionById } from "../services/demoVersionService.js";
import { createComment, getCommentsByVersionId } from "../services/commentService.js";
import { validateVersionNumber } from "../middleware/validateVersionNumber.js";
import { validateDemoId } from "../middleware/validateDemoId.js";

const router = Router();

router.post<{id: string, versionId: string}>("/:id/versions/:versionId/comments", validateDemoId, validateVersionNumber, async (req, res) => {

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

    const userId = process.env.DEV_USER_ID;

    if (!userId) {
        return res.status(500).json({
            message: "Development user is not configured"
        });
    }

    const comment = await createComment(
        version._id.toString(),
        userId,
        text
    );

    res.status(201).json(comment);
});

router.get<{id: string, versionId: string}>("/:id/versions/:versionId/comments", validateDemoId, validateVersionNumber, async (req, res) => {

    const versionId = Number(req.params.versionId);
    const demoId = req.params.id;

    const version = await getVersionById(demoId, versionId);

        if (!version) {
            return res.status(404).json({
                message: "Version not found"
            });
        }

    const comments = await getCommentsByVersionId(version._id.toString());

    res.json(comments);
});

export default router;