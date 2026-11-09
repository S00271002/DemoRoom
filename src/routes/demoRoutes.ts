import { Router } from "express";
import { createDemo, deleteDemo, getAllDemos, getDemoById } from "../services/demoService.js";
import { createDemoVersion } from "../services/demoVersionService.js";
import { getBandById } from "../services/bandService.js";
import { audioUpload } from "../middleware/audioUpload.js";
import { validateDemoId } from "../middleware/validateDemoId.js";
import { demoDetailsSchema, demoPatchSchema } from "../validation/demoSchemas.js";
import { removeUpload } from "../services/demoService.js";

const router = Router({ mergeParams: true });

// base route is "/api/demos"

router.get("/", async (req, res) => {
    const demos = await getAllDemos();
    res.json(demos);
});

//creates a new demo with an initial version
router.post("/", audioUpload.single("audio"), async (req, res) => {
    const body = req.body ?? {};
    const result = demoDetailsSchema.safeParse({ //ensures the demo details are valid according to the schema
        ...body,
        tempo: body.tempo ? Number(body.tempo) : undefined
    });

    if (!result.success || !req.file) {
        await removeUpload(req.file?.path); //removes the uploaded file if validation fails
        return res.status(400).json({
            message: "Demo details and an MP3 recording are required",
            errors: result.success ? [] : result.error.issues
        });
    }

    const userId = process.env.DEV_USER_ID;
    if (!userId) {
        //removes the uploaded file if there is no dev user configured
        await removeUpload(req.file.path); 
        return res.status(500).json({message: "Development user is not configured"});
    }

    const { title, description, bandId, tempo, key } = result.data; 
    let createdDemoId: string | undefined; // keeps track of the created demo ID so it can be cleaned up if something goes wrong

    try { //tries to create the demo and its initial version, and cleans up if something goes wrong
        const band = await getBandById(bandId);
        if (!band) { //checks the band exists
            await removeUpload(req.file.path);
            return res.status(404).json({message: "Band not found"});
        }

        if (!band.memberIds.some(memberId => memberId.toString() === userId)) { //checks the user is a member of the band
            await removeUpload(req.file.path);
            return res.status(403).json({message: "You must be a member of this band"});
        }

        const demo = await createDemo(title, description, userId, bandId, tempo, key);

        createdDemoId = demo._id.toString();

        //creates the first version of the demo with the uploaded audio file
        const firstVersion = await createDemoVersion(createdDemoId, req.file.path, "Initial version");
        const updatedDemo = await getDemoById(createdDemoId); 

        res.status(201).json({demo: updatedDemo, firstVersion});

    } catch (error) {
        if (createdDemoId) { //if demo was created but an error occurred later, it cleans up the created demo
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

//gets a specific demo by its ID
router.get<{id: string}>("/:id", validateDemoId, async (req, res) => {
    const demo = await getDemoById(req.params.id);
    if (!demo) {
        return res.status(404).json({message: "Demo not found"});
    }
    res.json(demo);
});

//updates all of a specific demo's details by its ID
router.put<{id: string}>("/:id", validateDemoId, async (req, res) => {
    //ensures the demo details are valid according to the schema, but doesnt check the bandId since it shouldn't be changed
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

//updates a specific demo's details by its ID, but only the fields that are provided in the request body
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

//deletes a specific demo by its ID
router.delete<{id: string}>("/:id", validateDemoId, async (req, res) => {
    const deleted = await deleteDemo(req.params.id);
    if (!deleted) {
        return res.status(404).json({message: "Demo not found"});
    }
    res.status(204).send();
});

export default router;
