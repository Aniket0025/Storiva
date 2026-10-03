import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import { encrypt, decrypt } from "../src/utils/crypto.js";
import { CloudAccount } from "../src/modules/cloudAccounts/cloudAccount.model.js";
import { storageManager } from "../src/modules/storage/storageManager.service.js";

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
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

describe("AES-256-GCM Symmetric Encryption Utility", () => {
  it("should correctly encrypt and decrypt a OAuth refresh token", () => {
    const originalToken = "1//04_google_refresh_token_secret_12345";
    const encrypted = encrypt(originalToken);

    expect(encrypted).not.toBe(originalToken);
    expect(encrypted).toContain(":"); // Format iv:authTag:ciphertext

    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(originalToken);
  });
});

describe("StorageManager Allocation Strategy (MOST_AVAILABLE_SPACE)", () => {
  const dummyUserId = new mongoose.Types.ObjectId();

  it("should calculate aggregate storage across multiple connected accounts", async () => {
    await CloudAccount.create([
      {
        userId: dummyUserId,
        provider: "google",
        providerAccountId: "google_1",
        email: "driveA@gmail.com",
        encryptedAccessToken: encrypt("acc_token_1"),
        encryptedRefreshToken: encrypt("ref_token_1"),
        tokenExpiresAt: new Date(Date.now() + 3600000),
        status: "ACTIVE",
        storage: { total: 15000, used: 5000, available: 10000 },
      },
      {
        userId: dummyUserId,
        provider: "google",
        providerAccountId: "google_2",
        email: "driveB@gmail.com",
        encryptedAccessToken: encrypt("acc_token_2"),
        encryptedRefreshToken: encrypt("ref_token_2"),
        tokenExpiresAt: new Date(Date.now() + 3600000),
        status: "ACTIVE",
        storage: { total: 15000, used: 2000, available: 13000 },
      },
    ]);

    const summary = await storageManager.getAggregateStorage(dummyUserId);

    expect(summary.connectedAccountsCount).toBe(2);
    expect(summary.total).toBe(30000);
    expect(summary.used).toBe(7000);
    expect(summary.available).toBe(23000);
  });

  it("should select the account with MOST_AVAILABLE_SPACE for uploads", async () => {
    const accA = await CloudAccount.create({
      userId: dummyUserId,
      provider: "google",
      providerAccountId: "google_1",
      email: "driveA@gmail.com",
      encryptedAccessToken: encrypt("acc_token_1"),
      encryptedRefreshToken: encrypt("ref_token_1"),
      tokenExpiresAt: new Date(Date.now() + 3600000),
      status: "ACTIVE",
      storage: { total: 15000, used: 12000, available: 3000 },
    });

    const accB = await CloudAccount.create({
      userId: dummyUserId,
      provider: "google",
      providerAccountId: "google_2",
      email: "driveB@gmail.com",
      encryptedAccessToken: encrypt("acc_token_2"),
      encryptedRefreshToken: encrypt("ref_token_2"),
      tokenExpiresAt: new Date(Date.now() + 3600000),
      status: "ACTIVE",
      storage: { total: 15000, used: 5000, available: 10000 }, // Winners: 10,000 available
    });

    // Request destination for 5,000 bytes upload
    const winningAccount = await storageManager.selectUploadDestination(
      dummyUserId,
      5000
    );

    expect(winningAccount._id.toString()).toBe(accB._id.toString());
    expect(winningAccount.email).toBe("driveb@gmail.com");
  });

  it("should throw STORAGE_LIMIT_EXCEEDED error if no account has enough capacity", async () => {
    await CloudAccount.create({
      userId: dummyUserId,
      provider: "google",
      providerAccountId: "google_1",
      email: "driveA@gmail.com",
      encryptedAccessToken: encrypt("acc_token_1"),
      encryptedRefreshToken: encrypt("ref_token_1"),
      tokenExpiresAt: new Date(Date.now() + 3600000),
      status: "ACTIVE",
      storage: { total: 15000, used: 14000, available: 1000 },
    });

    // Try to upload a 5,000 bytes file when available capacity is only 1,000
    await expect(
      storageManager.selectUploadDestination(dummyUserId, 5000)
    ).rejects.toThrow("No connected storage account has enough available space");
  });
});
