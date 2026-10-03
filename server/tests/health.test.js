import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";

describe("Phase 1 - Health & Infrastructure API", () => {
  it("GET /api/v1/health - should return 200 OK with valid health status", async () => {
    const response = await request(app).get("/api/v1/health");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.service).toBe("storiva-api");
    expect(response.body.data.status).toBe("ok");
    expect(response.body.data).toHaveProperty("database");
    expect(response.body.data).toHaveProperty("timestamp");
  });

  it("GET /api/v1/non-existing-route - should return 404 with structured error response", async () => {
    const response = await request(app).get("/api/v1/non-existing-route");

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBeDefined();
    expect(response.body.error.code).toBe("ROUTE_NOT_FOUND");
  });
});
