import { Router } from "express";
import { createDemo, deleteDemo, getAllDemos, getDemoById } from "../services/demoService.js";
import { createDemoVersion } from "../services/demoVersionService.js";
import { getBandById } from "../services/bandService.js";
import { audioUpload } from "../middleware/audioUpload.js";
import { unlink } from "node:fs/promises";
import { validateDemoId } from "../middleware/validateDemoId.js";
import { demoDetailsSchema, demoPatchSchema } from "../validation/demoSchemas.js";

const router = Router({ mergeParams: true });

async function removeUpload(audioPath?: string) {
    if (!audioPath) return;

    try {
        await unlink(audioPath);
    } catch (error) {
        console.error("Could not remove uploaded audio");
    }
}

router.get("/", async (req, res) => {
    const demos = await getAllDemos();
    res.json(demos);
});

router.post("/", audioUpload.single("audio"), async (req, res) => {
    const body = req.body ?? {};
    const result = demoDetailsSchema.safeParse({
        ...body,
        tempo: body.tempo ? Number(body.tempo) : undefined
    });

    if (!result.success || !req.file) {
        await removeUpload(req.file?.path);
        return res.status(400).json({
            message: "Demo details and an MP3 recording are required",
            errors: result.success ? [] : result.error.issues
        });
    }

    const userId = process.env.DEV_USER_ID;
    if (!userId) {
        await removeUpload(req.file.path);
        return res.status(500).json({message: "Development user is not configured"});
    }

    const { title, description, bandId, tempo, key } = result.data;
    let createdDemoId: string | undefined;

    try {
        const band = await getBandById(bandId);
        if (!band) {
            await removeUpload(req.file.path);
            return res.status(404).json({message: "Band not found"});
        }

        if (!band.memberIds.some(memberId => memberId.toString() === userId)) {
            await removeUpload(req.file.path);
            return res.status(403).json({message: "You must be a member of this band"});
        }

        const demo = await createDemo(title, description, userId, bandId, tempo, key);
        createdDemoId = demo._id.toString();
        const firstVersion = await createDemoVersion(createdDemoId, req.file.path, "Initial version");
        const updatedDemo = await getDemoById(createdDemoId);

        res.status(201).json({demo: updatedDemo, firstVersion});
    } catch (error) {
        if (createdDemoId) {
            try {
                await deleteDemo(createdDemoId);
            } catch (cleanupError) {
                console.error("Could not clean up incomplete demo");
            }
        }
        await removeUpload(req.file.path);
        throw error;
    }
});

router.get<{id: string}>("/:id", validateDemoId, async (req, res) => {
    const demo = await getDemoById(req.params.id);
    if (!demo) {
        return res.status(404).json({message: "Demo not found"});
    }
    res.json(demo);
});

router.put<{id: string}>("/:id", validateDemoId, async (req, res) => {
    const result = demoDetailsSchema.omit({bandId: true}).safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({message: "Invalid demo details", errors: result.error.issues});
    }

    const demo = await getDemoById(req.params.id);
    if (!demo) {
        return res.status(404).json({message: "Demo not found"});
    }

    demo.title = result.data.title;
    demo.description = result.data.description;
    demo.set("tempo", result.data.tempo);
    demo.set("key", result.data.key);
    await demo.save();
    res.json(demo);
});

router.patch<{id: string}>("/:id", validateDemoId, async (req, res) => {
    const result = demoPatchSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({message: "Invalid demo changes", errors: result.error.issues});
    }

    const demo = await getDemoById(req.params.id);
    if (!demo) {
        return res.status(404).json({message: "Demo not found"});
    }

    demo.set(result.data);
    await demo.save();
    res.json(demo);
});

router.delete<{id: string}>("/:id", validateDemoId, async (req, res) => {
    const deleted = await deleteDemo(req.params.id);
    if (!deleted) {
        return res.status(404).json({message: "Demo not found"});
    }
    res.status(204).send();
});

export default router;
