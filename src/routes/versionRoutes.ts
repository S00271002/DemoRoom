import { versionSchema } from "../validation/demoSchemas.js";
import { Router } from "express";
import { getDemoById } from "../services/demoService.js";
import { getVersionsByDemoId, createDemoVersion, getVersionById } from "../services/demoVersionService.js";
import { audioUpload } from "../middleware/audioUpload.js";
import { unlink } from "node:fs/promises";
import { validateDemoId } from "../middleware/validateDemoId.js";
import { validateVersionNumber } from "../middleware/validateVersionNumber.js";

const router = Router({ mergeParams: true });

// base route is "/api/versions"

//gets all versions for a specific demo
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

//creates a new version for a specific demo
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

//gets a specific version of a demo by its version number
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

//gets the audio file for a specific version of a demo
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
