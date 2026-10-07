import { Router } from "express";
import {demos, getNextDemoId, findDemoById, createDemo} from "../services/demoService.js";
import type { DemoVersion } from "../models/demoVersion.js";

const router = Router();

// Temporary storage
const demoVersions: DemoVersion[] = [];

let nextVersionId = 1;

router.get("/", (req, res) => {
    res.json(demos);
});

router.post("/", (req, res) => {
  const { title, description, author, tempo, key } = req.body;

  if (typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({
      message: "A demo title is required"
    });
  }

    const demo = createDemo(title, description, author, tempo, key);

    res.status(201).json(demo);
});

router.get("/:id/versions", (req, res) => {
    const demoId = getNextDemoId();

    const demo = findDemoById(demoId);

    if (!demo) {
        return res.status(404).json({
            message: "Demo not found"
        });
    }

    const versions = demoVersions.filter(
        (version) => version.demoId === demoId
    );

    res.json(versions);
});


router.post("/:id/versions", (req, res) => {
    const demoId = getNextDemoId();
    const demo = findDemoById(demoId);

    if (!demo) {
        return res.status(404).json({
            message: "Demo not found"
        });
    }

    const { audioPath, changeNote } = req.body;
    const errors: string[] = [];

    if (typeof audioPath !== "string" || audioPath.trim() === "") {
        errors.push("Audio path must be a non-empty string");
    }

    if (changeNote !== undefined && typeof changeNote !== "string") {
        errors.push("Change note must be a string");
    }

    if (errors.length > 0) {
        return res.status(400).json({
            message: "Version was not added",
            errors
        });
    }

    res.json({ message: "Version details are valid" });
});

router.get("/:id", (req, res) => {
  const demo = findDemoById(Number(req.params.id));

  if (!demo) {
    return res.status(404).json({
      message: "Demo not found"
    });
  }

  res.json(demo);
});

router.patch("/:id", (req, res) => {
    const demo = findDemoById(Number(req.params.id));

    if (!demo) {
        return res.status(404).json({
            message: "Demo not found"
        });
    }

    const { title, author,description, tempo, key } = req.body;

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

    if (
        author !== undefined &&
        (typeof author !== "string" || author.trim() === "")
    ) {
        errors.push("Author must be a non-empty string");
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

    if (author !== undefined) {
        demo.author = author.trim();
    }

    res.json(demo);
});

export default router;