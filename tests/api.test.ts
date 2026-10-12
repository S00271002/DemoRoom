import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import express from "express";
import request from "supertest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { errorHandler } from "../src/middleware/errorHandler.js";

// Replace database calls so these tests do not change real demos.
const services = vi.hoisted(() => ({
    getAllDemos: vi.fn(),
    getDemoById: vi.fn(),
    createDemo: vi.fn(),
    deleteDemo: vi.fn(),
    createDemoVersion: vi.fn(),
    getBandById: vi.fn()
}));

vi.mock("../src/services/demoService.js", () => ({
    getAllDemos: services.getAllDemos,
    getDemoById: services.getDemoById,
    createDemo: services.createDemo,
    deleteDemo: services.deleteDemo
}));

vi.mock("../src/services/demoVersionService.js", () => ({
    createDemoVersion: services.createDemoVersion
}));

vi.mock("../src/services/bandService.js", () => ({
    getBandById: services.getBandById
}));

// Upload fixtures go in a temporary folder, away from real recordings.
const originalDirectory = process.cwd();
const testDirectory = mkdtempSync(path.join(tmpdir(), "demoroom-tests-"));
process.chdir(testDirectory);

const demoRoutes = (await import("../src/routes/demoRoutes.js")).default;
const app = express();
app.use(express.json());
app.use("/api/demos", demoRoutes);
app.use(errorHandler);

const demoId = "507f1f77bcf86cd799439011";
const bandId = "507f1f77bcf86cd799439012";
const userId = "507f1f77bcf86cd799439013";
const missingId = "507f1f77bcf86cd799439099";
let demo: any;

beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv("DEV_USER_ID", userId);

    demo = {
        _id: demoId,
        title: "Guitar idea",
        description: "First draft",
        save: vi.fn().mockResolvedValue(undefined),
        set: vi.fn()
    };

    services.getAllDemos.mockResolvedValue([demo]);
    services.getDemoById.mockResolvedValue(demo);
    services.createDemo.mockResolvedValue(demo);
    services.deleteDemo.mockResolvedValue(true);
    services.createDemoVersion.mockResolvedValue({versionNumber: 1});
    services.getBandById.mockResolvedValue({memberIds: [userId]});
});

afterEach(() => {
    vi.unstubAllEnvs();
});

afterAll(() => {
    process.chdir(originalDirectory);
    // Remove only the temporary directory created by this test file.
    if (path.dirname(testDirectory) === path.resolve(tmpdir()) && path.basename(testDirectory).startsWith("demoroom-tests-")) {
        rmSync(testDirectory, {recursive: true});
    }
});

describe("Demo CRUD", () => {
    it("creates a demo with valid data", async () => {
        const response = await request(app).post("/api/demos")
            .field("title", "Guitar idea")
            .field("description", "First draft")
            .field("bandId", bandId)
            .attach("audio", Buffer.from("ID3 test fixture"), "test.mp3");

        expect(response.status).toBe(201);
        expect(response.body.demo._id).toBe(demoId);
    });

    it("rejects a demo with an empty title", async () => {
        const response = await request(app).post("/api/demos")
            .field("title", "")
            .field("description", "First draft")
            .field("bandId", bandId)
            .attach("audio", Buffer.from("ID3 test fixture"), "test.mp3");

        expect(response.status).toBe(400);
        expect(services.createDemo).not.toHaveBeenCalled();
    });

    it("gets all demos", async () => {
        const response = await request(app).get("/api/demos");

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);
    });

    it("gets one demo", async () => {
        const response = await request(app).get(`/api/demos/${demoId}`);

        expect(response.status).toBe(200);
        expect(response.body.title).toBe("Guitar idea");
    });

    it("returns 404 when a demo cannot be found", async () => {
        services.getDemoById.mockResolvedValue(null);
        const response = await request(app).get(`/api/demos/${missingId}`);

        expect(response.status).toBe(404);
    });

    it("updates a demo with PUT", async () => {
        const response = await request(app).put(`/api/demos/${demoId}`)
            .send({title: "New title", description: "New description"});

        expect(response.status).toBe(200);
        expect(response.body.title).toBe("New title");
        expect(demo.save).toHaveBeenCalledOnce();
    });

    it("returns 404 when updating a missing demo", async () => {
        services.getDemoById.mockResolvedValue(null);
        const response = await request(app).put(`/api/demos/${missingId}`)
            .send({title: "New title", description: "New description"});

        expect(response.status).toBe(404);
    });

    it("rejects invalid PUT data", async () => {
        const response = await request(app).put(`/api/demos/${demoId}`)
            .send({title: "", description: "First draft"});

        expect(response.status).toBe(400);
        expect(demo.save).not.toHaveBeenCalled();
    });

    it("deletes a demo", async () => {
        const response = await request(app).delete(`/api/demos/${demoId}`);

        expect(response.status).toBe(204);
        expect(services.deleteDemo).toHaveBeenCalledWith(demoId);
    });

    it("returns 404 when deleting a missing demo", async () => {
        services.deleteDemo.mockResolvedValue(false);
        const response = await request(app).delete(`/api/demos/${missingId}`);

        expect(response.status).toBe(404);
    });
});
