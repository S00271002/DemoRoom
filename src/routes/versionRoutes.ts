import { Router } from "express";
import {getDemoById} from "../services/demoService.js";
import {getVersionsByDemoId, createDemoVersion, getVersionById } from "../services/demoVersionService.js";
import { audioUpload } from "../middleware/audioUpload.js";
import { unlink } from "node:fs/promises";

const router = Router();

router.get("/:id/versions", async (req, res) => {

    const demo = await getDemoById(req.params.id);

    if (!demo) {
        return res.status(404).json({
            message: "Demo not found"
        });
    }

    const versions = await getVersionsByDemoId(demo._id.toString());

    res.json(versions);
});


router.post("/:id/versions", audioUpload.single("audio"), async (req, res) => {
    
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

    const { changeNote } = req.body;
    const errors: string[] = [];

    if(!req.file){
        errors.push("Audio file is required");
    }

    if (typeof changeNote !== "string" || changeNote.trim() === "") {
    errors.push("A change note is required");
    }      

    if (errors.length > 0) {
        if (req.file) {
            await unlink(req.file.path);
            }

            return res.status(400).json({
                message: "Version was not added",
                errors
            });
    }

    if (!req.file) {
        return res.status(400).json({
            message: "An MP3 recording is required"
        });
    }

    const audioPath = req.file.path;
    const demoVersion = await createDemoVersion(demoId, audioPath, changeNote);

    res.status(201).json(demoVersion);
});
    


router.get("/:id/versions/:versionId", async (req, res) => {
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

router.get("/:id/versions/:versionId/audio", async (req, res) => {
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