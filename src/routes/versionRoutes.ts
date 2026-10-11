import { versionSchema } from "../validation/demoSchemas.js";
import { Router } from "express";
import { getDemoById } from "../services/demoService.js";
import { getVersionsByDemoId, createDemoVersion, getVersionById } from "../services/demoVersionService.js";
import { audioUpload } from "../middleware/audioUpload.js";
import { unlink } from "node:fs/promises";
import { validateDemoId } from "../middleware/validateDemoId.js";
import { validateVersionNumber } from "../middleware/validateVersionNumber.js";

const router = Router({ mergeParams: true });

router.get<{ id: string }>("/", validateDemoId, async (req, res) => {
    const demo = await getDemoById(req.params.id);

    if (!demo) {
        return res.status(404).json({
            message: "Demo not found"
        });
    }

    const versions = await getVersionsByDemoId(demo._id.toString());
    res.json(versions);
});

router.post<{ id: string }>("/", validateDemoId, audioUpload.single("audio"), async (req, res) => {
    const demoId = req.params.id;

    if (typeof demoId !== "string") {
        if (req.file) {
            await unlink(req.file.path);
        }

        return res.status(400).json({
            message: "Invalid demo ID"
        });
    }

    const demo = await getDemoById(demoId);

    if (!demo) {
        if (req.file) {
            await unlink(req.file.path);
        }

        return res.status(404).json({
            message: "Demo not found"
        });
    }

    const result = versionSchema.safeParse(req.body);

    if (!result.success || !req.file) {
        if (req.file) {
            await unlink(req.file.path);
        }

        return res.status(400).json({
            message: "Recording and change note are required",
            errors: result.success ? [] : result.error.issues
        });
    }

    const { changeNote } = result.data;
    const audioPath = req.file.path;
    const demoVersion = await createDemoVersion(demoId, audioPath, changeNote);

    res.status(201).json(demoVersion);
});

router.get<{ id: string, versionId: string }>("/:versionId", validateDemoId, validateVersionNumber, async (req, res) => {
    const demoId = req.params.id;
    const versionId = Number(req.params.versionId);
    const demo = await getDemoById(demoId);

    if (!demo) {
        return res.status(404).json({
            message: "Demo not found"
        });
    }

    const version = await getVersionById(demoId, versionId);

    if (!version) {
        return res.status(404).json({
            message: "Version not found"
        });
    }

    res.json(version);
});

router.get<{ id: string, versionId: string }>("/:versionId/audio", validateDemoId, validateVersionNumber, async (req, res) => {
    const demoId = req.params.id;
    const versionId = Number(req.params.versionId);
    const version = await getVersionById(demoId, versionId);

    if (!version) {
        return res.status(404).json({
            message: "Version not found"
        });
    }

    res.sendFile(version.audioPath);
});

export default router;
