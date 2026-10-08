import { Router } from "express";
import {demos, getDemoById, createDemo} from "../services/demoService.js";
import {getVersionsByDemoId, createDemoVersion, getVersionById } from "../services/demoVersionService.js";
import { createComment, getCommentsByVersionId } from "../services/commentService.js";
import { audioUpload } from "../middleware/audioUpload.js";
import { unlink } from "node:fs/promises";
const router = Router();

router.get("/", (req, res) => {
    res.json(demos);
});

router.post("/", audioUpload.single("audio"), async (req, res) => {
    
    const { title, description, key } = req.body;
    const tempo = Number(req.body.tempo);

    const errors: string[] = [];

    if(!req.file){
        errors.push("Audio file is required");
    }


    if (typeof title !== "string" || title.trim() === "") {
        errors.push("A title is required");
    }

    if (typeof description !== "string" || description.trim() === "") {
        errors.push("A description is required");
    }

    if (typeof tempo !== "number" || !Number.isFinite(tempo) || tempo <= 0) {
        errors.push("A valid tempo is required");
    }

    if (typeof key !== "string") {
        errors.push("Key must be a string");
    }

    if (errors.length > 0) {
    if (req.file) {
        await unlink(req.file.path);
        }

        return res.status(400).json({
            message: "Demo was not created",
            errors
        });
    }

    if (!req.file) {
        return res.status(400).json({
            message: "An MP3 recording is required"
        });
    }

    const audioPath = req.file.path;

    const demo = createDemo(title, description, tempo, key);

    const firstVersion = createDemoVersion(demo.id, audioPath, "Initial version");

    res.status(201).json({demo, firstVersion});
});

router.get("/:id", (req, res) => {
  const demo = getDemoById(Number(req.params.id));

  if (!demo) {
    return res.status(404).json({
      message: "Demo not found"
    });
  }

  res.json(demo);
});

router.get("/:id/versions", (req, res) => {

    const demo = getDemoById(Number(req.params.id));

    if (!demo) {
        return res.status(404).json({
            message: "Demo not found"
        });
    }

    const versions = getVersionsByDemoId(demo.id);

    res.json(versions);
});


router.post("/:id/versions", audioUpload.single("audio"), async (req, res) => {
    
    const demo = getDemoById(Number(req.params.id));

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

    const demoVersion = createDemoVersion(demo.id, audioPath, changeNote);

    res.status(201).json(demoVersion);
});
    
router.patch("/:id", (req, res) => {
    const demo = getDemoById(Number(req.params.id));

    if (!demo) {
        return res.status(404).json({
            message: "Demo not found"
        });
    }

    const { title, description, tempo, key } = req.body;

    const errors: string[] = [];

    if (
        title !== undefined &&
        (typeof title !== "string" || title.trim() === "")
    ) {
        errors.push("Title must be a non-empty string");
    }

    if (
        description !== undefined &&
        typeof description !== "string"
    ) {
        errors.push("Description must be a string");
    }

    if (
        tempo !== undefined &&
        (
            typeof tempo !== "number" ||
            !Number.isFinite(tempo) ||
            tempo <= 0
        )
    ) {
        errors.push("Tempo must be a positive number");
    }

    if (
        key !== undefined &&
        (typeof key !== "string" || key.trim() === "")
    ) {
        errors.push("Key must be a non-empty string");
    }

    if (errors.length > 0) {
        return res.status(400).json({
            message: "Demo was not updated",
            errors
        });
    }

    if (title !== undefined) {
        demo.title = title.trim();
    }

    if (description !== undefined) {
        demo.description = description;
    }

    if (tempo !== undefined) {
        demo.tempo = tempo;
    }

    if (key !== undefined) {
        demo.key = key.trim();
    }


    res.json(demo);
});

router.get("/:id/versions/:versionId", (req, res) => {
    const demoId = Number(req.params.id);
    const versionId = Number(req.params.versionId);

    const demo = getDemoById(demoId);

    if (!demo) {
        return res.status(404).json({
            message: "Demo not found"
        });
    }

    const version = getVersionById(demoId, versionId);

    if (!version) {
        return res.status(404).json({
            message: "Version not found"
        });
    }

    res.json(version);
});

router.get("/:id/versions/:versionId/audio", (req, res) => {
    const demoId = Number(req.params.id);
    const versionId = Number(req.params.versionId);

    const version = getVersionById(demoId, versionId);

    if (!version) {
        return res.status(404).json({
            message: "Version not found"
        });
    }

    res.sendFile(version.audioPath);
});

router.post("/:id/versions/:versionId/comments", (req, res) => {

    const versionId = Number(req.params.versionId);
    const demoId = Number(req.params.id);

    const version = getVersionById(demoId, versionId);

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

router.get("/:id/versions/:versionId/comments", (req, res) => {

    const versionId = Number(req.params.versionId);
    const demoId = Number(req.params.id);

    const version = getVersionById(demoId, versionId);

        if (!version) {
            return res.status(404).json({
                message: "Version not found"
            });
        }

    const comments = getCommentsByVersionId(versionId);

    res.json(comments);
});

    

export default router;