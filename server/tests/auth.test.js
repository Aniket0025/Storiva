import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import app from "../src/app.js";
import { User } from "../src/modules/users/user.model.js";

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
}, 60000); // 60s timeout for initial binary download/startup

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

afterEach(async () => {
  if (mongoose.connection.readyState === 1) {
    await User.deleteMany({});
  }
});

describe("Phase 2 — Authentication API Integration Tests", () => {
  const testUser = {
    name: "Alex Developer",
    email: "alex@storiva.io",
    password: "Password123!",
  };

  describe("POST /api/v1/auth/register", () => {
    it("should successfully register a new user and set auth cookie", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(testUser);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe(testUser.email.toLowerCase());
      expect(response.body.data.user.name).toBe(testUser.name);
      expect(response.body.data.user).not.toHaveProperty("passwordHash");

      // Verify Set-Cookie header contains token
      const cookies = response.headers["set-cookie"];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain("token=");
    });

    it("should reject registration if email is already taken", async () => {
      await request(app).post("/api/v1/auth/register").send(testUser);

      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(testUser);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("EMAIL_ALREADY_EXISTS");
    });

    it("should reject registration with weak or short password", async () => {
      const response = await request(app).post("/api/v1/auth/register").send({
        name: "Short Pass",
        email: "short@storiva.io",
        password: "123",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("POST /api/v1/auth/login", () => {
    beforeEach(async () => {
      await request(app).post("/api/v1/auth/register").send(testUser);
    });

    it("should successfully log in with correct credentials", async () => {
      const response = await request(app).post("/api/v1/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(testUser.email.toLowerCase());
      expect(response.headers["set-cookie"]).toBeDefined();
    });

    it("should reject login with wrong password", async () => {
      const response = await request(app).post("/api/v1/auth/login").send({
        email: testUser.email,
        password: "WrongPassword!",
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("INVALID_CREDENTIALS");
    });
  });

  describe("GET /api/v1/auth/me", () => {
    it("should return user profile when authenticated", async () => {
      const regResponse = await request(app)
        .post("/api/v1/auth/register")
        .send(testUser);

      const cookie = regResponse.headers["set-cookie"];

      const response = await request(app)
        .get("/api/v1/auth/me")
        .set("Cookie", cookie);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(testUser.email.toLowerCase());
    });

    it("should reject unauthenticated profile requests with 401", async () => {
      const response = await request(app).get("/api/v1/auth/me");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("UNAUTHORIZED");
    });
  });

  describe("POST /api/v1/auth/logout", () => {
    it("should clear auth cookie on logout", async () => {
      const response = await request(app).post("/api/v1/auth/logout");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.headers["set-cookie"][0]).toContain("token=;");
    });
  });
});
