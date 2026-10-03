import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import app from "../src/app.js";
import { User } from "../src/modules/users/user.model.js";
import { CloudAccount } from "../src/modules/cloudAccounts/cloudAccount.model.js";
import { encrypt } from "../src/utils/crypto.js";

let mongoServer;
let authCookie;
let testUserId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Register a test user to obtain auth cookie
  const regResponse = await request(app).post("/api/v1/auth/register").send({
    name: "Cloud User",
    email: "clouduser@storiva.io",
    password: "Password123!",
  });

  authCookie = regResponse.headers["set-cookie"];
  testUserId = regResponse.body.data.user.id;
}, 60000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

afterEach(async () => {
  if (mongoose.connection.readyState === 1) {
    await CloudAccount.deleteMany({});
  }
});

describe("Phase 5 & 6 — CloudAccount & Google OAuth Endpoints", () => {
  describe("POST /api/v1/cloud-accounts/google/connect", () => {
    it("should generate a Google consent URL and set oauth_state cookie", async () => {
      const response = await request(app)
        .post("/api/v1/cloud-accounts/google/connect")
        .set("Cookie", authCookie);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.url).toBeDefined();
      expect(response.body.data.url).toContain("accounts.google.com");
      expect(response.body.data.url).toContain("response_type=code");
      expect(response.body.data.url).toContain("access_type=offline");

      // Verify CSRF oauth_state cookie set
      const cookies = response.headers["set-cookie"];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain("oauth_state=");
    });

    it("should reject unauthenticated connect requests with 401", async () => {
      const response = await request(app).post("/api/v1/cloud-accounts/google/connect");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("UNAUTHORIZED");
    });
  });

  describe("GET /api/v1/cloud-accounts", () => {
    it("should return connected accounts list for authenticated user", async () => {
      // Seed a connected account
      await CloudAccount.create({
        userId: testUserId,
        provider: "google",
        providerAccountId: "google_12345",
        email: "personal.drive@gmail.com",
        encryptedAccessToken: encrypt("test_access_token"),
        encryptedRefreshToken: encrypt("test_refresh_token"),
        tokenExpiresAt: new Date(Date.now() + 3600000),
        status: "ACTIVE",
        storage: { total: 15000, used: 3000, available: 12000 },
      });

      const response = await request(app)
        .get("/api/v1/cloud-accounts")
        .set("Cookie", authCookie);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.accounts).toBeDefined();
      expect(response.body.data.accounts.length).toBe(1);
      expect(response.body.data.accounts[0].email).toBe("personal.drive@gmail.com");
      expect(response.body.data.accounts[0]).not.toHaveProperty("encryptedAccessToken");
    });
  });

  describe("DELETE /api/v1/cloud-accounts/:id", () => {
    it("should successfully disconnect a connected cloud account", async () => {
      const account = await CloudAccount.create({
        userId: testUserId,
        provider: "google",
        providerAccountId: "google_999",
        email: "disconnect.me@gmail.com",
        encryptedAccessToken: encrypt("test_token"),
        encryptedRefreshToken: encrypt("test_token"),
        tokenExpiresAt: new Date(Date.now() + 3600000),
        status: "ACTIVE",
      });

      const response = await request(app)
        .delete(`/api/v1/cloud-accounts/${account._id}`)
        .set("Cookie", authCookie);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const dbCheck = await CloudAccount.findById(account._id);
      expect(dbCheck).toBeNull();
    });
  });
});
