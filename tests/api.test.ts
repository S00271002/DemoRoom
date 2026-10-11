import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

// These tests exercise Express, Zod and Multer together. Database services are
// mocked, so running the tests never changes the assessment database.
const services = vi.hoisted(() => ({
    getAllDemos: vi.fn(),
    getDemoById: vi.fn(),
    createDemo: vi.fn(),
    deleteDemo: vi.fn(),
    getVersionsByDemoId: vi.fn(),
    getVersionById: vi.fn(),
    createDemoVersion: vi.fn(),
    getBandById: vi.fn(),
    createBand: vi.fn(),
    getBandsByUserId: vi.fn(),
    createComment: vi.fn(),
    getCommentsByVersionId: vi.fn(),
    getUserByEmail: vi.fn(),
    createUser: vi.fn(),
    getUserForLogin: vi.fn(),
    verifyPassword: vi.fn()
}));

vi.mock("../src/services/demoService.js", () => ({
    getAllDemos: services.getAllDemos,
    getDemoById: services.getDemoById,
    createDemo: services.createDemo,
    deleteDemo: services.deleteDemo
}));
vi.mock("../src/services/demoVersionService.js", () => ({
    getVersionsByDemoId: services.getVersionsByDemoId,
    getVersionById: services.getVersionById,
    createDemoVersion: services.createDemoVersion
}));
vi.mock("../src/services/bandService.js", () => ({
    getBandById: services.getBandById,
    createBand: services.createBand,
    getBandsByUserId: services.getBandsByUserId
}));
vi.mock("../src/services/commentService.js", () => ({
    createComment: services.createComment,
    getCommentsByVersionId: services.getCommentsByVersionId
}));
vi.mock("../src/services/userService.js", () => ({
    getUserByEmail: services.getUserByEmail,
    createUser: services.createUser,
    getUserForLogin: services.getUserForLogin
}));
vi.mock("../src/services/passwordService.js", () => ({
    verifyPassword: services.verifyPassword
}));

// Multer resolves uploads relative to the working directory when imported.
// Use a temporary directory, keeping real recordings and .env files untouched.
const originalDirectory = process.cwd();
const testDirectory = mkdtempSync(path.join(tmpdir(), "demoroom-tests-"));
process.chdir(testDirectory);
const app = (await import("../src/app.js")).default;
const uploads = path.join(testDirectory, "uploads");

const demoId = "507f1f77bcf86cd799439011";
const bandId = "507f1f77bcf86cd799439012";
const userId = "507f1f77bcf86cd799439013";
const versionId = "507f1f77bcf86cd799439014";
const missingId = "507f1f77bcf86cd799439099";
const audioBytes = Buffer.from("ID3 test upload fixture");
let demo: any;
let version: any;

beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv("DEV_USER_ID", userId);

    demo = {
        _id: demoId,
        title: "Guitar idea",
        description: "First draft",
        userId,
        bandId,
        tempo: 120,
        key: "Am",
        currentVersionId: versionId,
        save: vi.fn().mockImplementation(async () => demo),
        set: vi.fn().mockImplementation((name: string, value: unknown) => {
            demo[name] = value;
        })
    };
    version = {
        _id: versionId,
        demoId,
        versionNumber: 1,
        audioPath: path.join(uploads, "recording.mp3"),
        changeNote: "Initial version"
    };

    services.getAllDemos.mockResolvedValue([demo]);
    services.getDemoById.mockImplementation(async (id: string) => id === demoId ? demo : null);
    services.createDemo.mockResolvedValue(demo);
    services.deleteDemo.mockImplementation(async (id: string) => id === demoId);
    services.getBandById.mockResolvedValue({ _id: bandId, memberIds: [userId] });
    services.getVersionsByDemoId.mockResolvedValue([version]);
    services.getVersionById.mockImplementation(async (id: string, number: number) =>
        id === demoId && number === 1 ? version : null
    );
    services.createDemoVersion.mockResolvedValue(version);
    services.getCommentsByVersionId.mockResolvedValue([]);
    services.createComment.mockImplementation(async (id: string, author: string, text: string) => ({
        _id: "507f1f77bcf86cd799439015", versionId: id, userId: author, text
    }));
});

afterEach(() => {
    // Only remove files in this test's temporary upload directory.
    for (const filename of readdirSync(uploads)) {
        rmSync(path.join(uploads, filename));
    }
    vi.unstubAllEnvs();
});

afterAll(() => {
    process.chdir(originalDirectory);
    rmSync(testDirectory, { recursive: true });
});

describe("Demo CRUD", () => {
    it("POST creates a demo and its first recording from multipart data", async () => {
        const response = await request(app).post("/api/demos")
            .field("title", "  Guitar idea  ")
            .field("description", "First draft")
            .field("bandId", bandId)
            .field("tempo", "120")
            .field("key", "Am")
            .attach("audio", audioBytes, "recording.mp3");

        expect(response.status).toBe(201);
        expect(response.body.demo._id).toBe(demoId);
        expect(response.body.demo.currentVersionId).toBe(versionId);
        expect(response.body.firstVersion.versionNumber).toBe(1);
        expect(services.createDemo).toHaveBeenCalledWith("Guitar idea", "First draft", userId, bandId, 120, "Am");
        const filename = readdirSync(uploads)[0];
        expect(filename).toMatch(/\.mp3$/);
        expect(services.createDemoVersion).toHaveBeenCalledWith(demoId, path.join(uploads, filename!), "Initial version");
    });

    it("POST rejects invalid fields and removes the uploaded file", async () => {
        const response = await request(app).post("/api/demos")
            .field("title", " ")
            .field("description", "First draft")
            .field("bandId", bandId)
            .attach("audio", audioBytes, "recording.mp3");

        expect(response.status).toBe(400);
        expect(services.createDemo).not.toHaveBeenCalled();
        expect(readdirSync(uploads)).toEqual([]);
    });

    it("GET returns the demo collection", async () => {
        const response = await request(app).get("/api/demos");
        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0]._id).toBe(demoId);
    });

    it("GET returns an existing demo", async () => {
        const response = await request(app).get(`/api/demos/${demoId}`);
        expect(response.status).toBe(200);
        expect(response.body.title).toBe("Guitar idea");
    });

    it("GET returns 404 for a missing demo", async () => {
        const response = await request(app).get(`/api/demos/${missingId}`);
        expect(response.status).toBe(404);
    });

    it("PUT replaces metadata while preserving ownership and recording history", async () => {
        const response = await request(app).put(`/api/demos/${demoId}`)
            .send({ title: "New title", description: "New description" });

        expect(response.status).toBe(200);
        expect(response.body.title).toBe("New title");
        expect(response.body.description).toBe("New description");
        expect(response.body.bandId).toBe(bandId);
        expect(response.body.userId).toBe(userId);
        expect(response.body.currentVersionId).toBe(versionId);
        expect(response.body.tempo).toBeUndefined();
        expect(response.body.key).toBeUndefined();
        expect(demo.save).toHaveBeenCalledOnce();
    });

    it("PUT returns 404 for a missing demo", async () => {
        const response = await request(app).put(`/api/demos/${missingId}`)
            .send({ title: "New title", description: "New description" });
        expect(response.status).toBe(404);
        expect(demo.save).not.toHaveBeenCalled();
    });

    it("PUT rejects invalid metadata without saving changes", async () => {
        const response = await request(app).put(`/api/demos/${demoId}`)
            .send({ title: "New title", description: "", tempo: 0.5 });
        expect(response.status).toBe(400);
        expect(demo.title).toBe("Guitar idea");
        expect(demo.save).not.toHaveBeenCalled();
    });

    it("DELETE returns 204 for an existing demo", async () => {
        const response = await request(app).delete(`/api/demos/${demoId}`);
        expect(response.status).toBe(204);
        expect(response.text).toBe("");
        expect(services.deleteDemo).toHaveBeenCalledWith(demoId);
    });

    it("DELETE returns 404 for a missing demo", async () => {
        const response = await request(app).delete(`/api/demos/${missingId}`);
        expect(response.status).toBe(404);
    });
});

describe("Validation and nested routers", () => {
    it("serves the OpenAPI description for the submitted endpoints", async () => {
        const response = await request(app).get("/openapi.json");
        expect(response.status).toBe(200);
        expect(response.body.openapi).toMatch(/^3\./);
        expect(response.body.paths["/api/demos"].post).toBeDefined();
    });

    it("rejects malformed demo IDs before querying storage", async () => {
        const response = await request(app).get("/api/demos/not-an-id");
        expect(response.status).toBe(400);
        expect(services.getDemoById).not.toHaveBeenCalled();
    });

    it("nested version router inherits the demo ID from its mount path", async () => {
        const response = await request(app).get(`/api/demos/${demoId}/versions`);
        expect(response.status).toBe(200);
        expect(services.getVersionsByDemoId).toHaveBeenCalledWith(demoId);
        expect(response.body[0].versionNumber).toBe(1);
    });

    it.each(["0", "-1", "1.5", "abc"])("rejects invalid version number %s", async (number) => {
        const response = await request(app).get(`/api/demos/${demoId}/versions/${number}`);
        expect(response.status).toBe(400);
        expect(services.getVersionById).not.toHaveBeenCalled();
    });

    it("comments are queried using the selected recording's unique ID", async () => {
        const response = await request(app).get(`/api/demos/${demoId}/versions/1/comments`);
        expect(response.status).toBe(200);
        expect(services.getVersionById).toHaveBeenCalledWith(demoId, 1);
        expect(services.getCommentsByVersionId).toHaveBeenCalledWith(versionId);
    });

    it("comment author comes from server configuration, not the submitted body", async () => {
        const response = await request(app).post(`/api/demos/${demoId}/versions/1/comments`)
            .send({ text: "  Great chorus  ", userId: missingId });
        expect(response.status).toBe(201);
        expect(services.createComment).toHaveBeenCalledWith(versionId, userId, "Great chorus");
        expect(response.body.userId).toBe(userId);
    });

    it("rejects blank comments without creating records", async () => {
        const response = await request(app).post(`/api/demos/${demoId}/versions/1/comments`)
            .send({ text: "  " });
        expect(response.status).toBe(400);
        expect(services.createComment).not.toHaveBeenCalled();
    });

    it("rejects a revision without a change note and removes its upload", async () => {
        const response = await request(app).post(`/api/demos/${demoId}/versions`)
            .attach("audio", audioBytes, "revision.mp3");
        expect(response.status).toBe(400);
        expect(services.createDemoVersion).not.toHaveBeenCalled();
        expect(readdirSync(uploads)).toEqual([]);
    });

    it("requires a valid band ID when creating a demo", async () => {
        const response = await request(app).post("/api/demos")
            .field("title", "Guitar idea")
            .field("description", "First draft")
            .field("bandId", "Test Band")
            .attach("audio", audioBytes, "recording.mp3");
        expect(response.status).toBe(400);
        expect(services.createDemo).not.toHaveBeenCalled();
        expect(readdirSync(uploads)).toEqual([]);
    });

    it("prevents a non-member from uploading to a band and cleans up the file", async () => {
        services.getBandById.mockResolvedValue({ _id: bandId, memberIds: [missingId] });
        const response = await request(app).post("/api/demos")
            .field("title", "Guitar idea")
            .field("description", "First draft")
            .field("bandId", bandId)
            .attach("audio", audioBytes, "recording.mp3");
        expect(response.status).toBe(403);
        expect(services.createDemo).not.toHaveBeenCalled();
        expect(readdirSync(uploads)).toEqual([]);
    });

    it("cleans up the uploaded file if development identity is missing", async () => {
        vi.stubEnv("DEV_USER_ID", "");
        const response = await request(app).post("/api/demos")
            .field("title", "Guitar idea")
            .field("description", "First draft")
            .field("bandId", bandId)
            .attach("audio", audioBytes, "recording.mp3");
        expect(response.status).toBe(500);
        expect(services.createDemo).not.toHaveBeenCalled();
        expect(readdirSync(uploads)).toEqual([]);
    });

    it("rejects unsupported file extensions with JSON", async () => {
        const response = await request(app).post("/api/demos")
            .field("title", "Guitar idea")
            .field("description", "First draft")
            .field("bandId", bandId)
            .attach("audio", audioBytes, "recording.txt");
        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Please upload an MP3 file");
    });
});
