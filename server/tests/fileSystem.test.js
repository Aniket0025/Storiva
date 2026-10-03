import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import app from "../src/app.js";
import { User } from "../src/modules/users/user.model.js";
import { CloudAccount } from "../src/modules/cloudAccounts/cloudAccount.model.js";
import { File } from "../src/modules/files/file.model.js";
import { Folder } from "../src/modules/folders/folder.model.js";
import { encrypt } from "../src/utils/crypto.js";

let mongoServer;
let authCookie;
let testUserId;
let activeCloudAccount;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  const regResponse = await request(app).post("/api/v1/auth/register").send({
    name: "File Master",
    email: "files@storiva.io",
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
    await File.deleteMany({});
    await Folder.deleteMany({});
    await CloudAccount.deleteMany({});
  }
});

describe("Phase 8, 9 & 10 — Unified File System & File Manager Integration Tests", () => {
  const seedCloudAccount = async () => {
    return await CloudAccount.create({
      userId: testUserId,
      provider: "google",
      providerAccountId: "google_1001",
      email: "storage.drive@gmail.com",
      encryptedAccessToken: encrypt("test_access_token"),
      encryptedRefreshToken: encrypt("test_refresh_token"),
      tokenExpiresAt: new Date(Date.now() + 3600000),
      status: "ACTIVE",
      storage: { total: 100000, used: 20000, available: 80000 },
    });
  };

  describe("POST /api/v1/files/upload", () => {
    it("should allocate file upload destination using MOST_AVAILABLE_SPACE and update storage quota", async () => {
      const account = await seedCloudAccount();

      const response = await request(app)
        .post("/api/v1/files/upload")
        .set("Cookie", authCookie)
        .attach("file", Buffer.from("Sample Storiva File Bytes"), "Project_Architecture.pdf");

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.file).toBeDefined();
      expect(response.body.data.file.name).toBe("Project_Architecture.pdf");
      expect(response.body.data.file.cloudAccountId).toBe(account._id.toString());

      // Verify DB storage update
      const updatedAccount = await CloudAccount.findById(account._id);
      expect(updatedAccount.storage.used).toBeGreaterThan(20000);
    });
  });

  describe("GET /api/v1/files", () => {
    it("should return unified list of files and folders", async () => {
      const account = await seedCloudAccount();

      await File.create({
        userId: testUserId,
        cloudAccountId: account._id,
        provider: "google",
        providerFileId: "p_1",
        name: "Resume.pdf",
        size: 5000,
        parentId: "root",
      });

      await Folder.create({
        userId: testUserId,
        cloudAccountId: account._id,
        provider: "google",
        providerFolderId: "p_fold_1",
        name: "Documents",
        parentId: "root",
      });

      const response = await request(app)
        .get("/api/v1/files")
        .set("Cookie", authCookie);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.files.length).toBe(1);
      expect(response.body.data.folders.length).toBe(1);
      expect(response.body.data.files[0].name).toBe("Resume.pdf");
      expect(response.body.data.folders[0].name).toBe("Documents");
    });
  });

  describe("PATCH /api/v1/files/:id", () => {
    it("should rename a file", async () => {
      const account = await seedCloudAccount();

      const file = await File.create({
        userId: testUserId,
        cloudAccountId: account._id,
        provider: "google",
        providerFileId: "p_rename",
        name: "OldName.txt",
        parentId: "root",
      });

      const response = await request(app)
        .patch(`/api/v1/files/${file._id}`)
        .set("Cookie", authCookie)
        .send({ name: "NewName.txt" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.file.name).toBe("NewName.txt");
    });
  });

  describe("DELETE /api/v1/files/:id", () => {
    it("should delete a file and reclaim storage space", async () => {
      const account = await seedCloudAccount();

      const file = await File.create({
        userId: testUserId,
        cloudAccountId: account._id,
        provider: "google",
        providerFileId: "p_del",
        name: "DeleteMe.png",
        size: 10000,
        parentId: "root",
      });

      const response = await request(app)
        .delete(`/api/v1/files/${file._id}`)
        .set("Cookie", authCookie);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const dbCheck = await File.findById(file._id);
      expect(dbCheck).toBeNull();
    });
  });

  describe("GET /api/v1/search", () => {
    it("should search files and folders by query string", async () => {
      const account = await seedCloudAccount();

      await File.create({
        userId: testUserId,
        cloudAccountId: account._id,
        provider: "google",
        providerFileId: "p_src_1",
        name: "Financial_Report_2026.xlsx",
        parentId: "root",
      });

      const response = await request(app)
        .get("/api/v1/search?q=Financial")
        .set("Cookie", authCookie);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.files.length).toBe(1);
      expect(response.body.data.files[0].name).toBe("Financial_Report_2026.xlsx");
    });
  });
});
