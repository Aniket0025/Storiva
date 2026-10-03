import crypto from "crypto";
import { google } from "googleapis";
import { env } from "../../config/env.js";
import { CloudAccount } from "./cloudAccount.model.js";
import { AppError } from "../../utils/AppError.js";
import { encrypt } from "../../utils/crypto.js";
import { GoogleDriveProvider } from "../../providers/googleDrive/GoogleDriveProvider.js";

const createOAuth2Client = () => {
  return new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_REDIRECT_URI
  );
};

/**
 * Generate Google OAuth authorization consent URL with state protection
 * @param {string} userId
 * @returns {{ url: string, state: string }}
 */
export const getGoogleAuthUrl = (userId) => {
  const oauth2Client = createOAuth2Client();

  // Cryptographically secure state string protecting against CSRF
  const randomState = crypto.randomBytes(24).toString("hex");
  const statePayload = Buffer.from(
    JSON.stringify({ state: randomState, userId })
  ).toString("base64url");

  const scopes = [
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/userinfo.email",
    "openid",
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline", // Forces Google to issue refresh_token
    prompt: "consent", // Ensures consent screen appears for refresh token delivery
    scope: scopes,
    state: statePayload,
  });

  return { url, state: statePayload };
};

/**
 * Process Google OAuth callback, exchange code for tokens, and store CloudAccount
 * @param {string} authenticatedUserId
 * @param {string} code - OAuth authorization code from Google
 * @returns {Promise<object>} Safe CloudAccount record
 */
export const handleGoogleOAuthCallback = async (authenticatedUserId, code) => {
  if (!code) {
    throw new AppError("Authorization code is missing.", 400, "MISSING_AUTH_CODE");
  }

  const oauth2Client = createOAuth2Client();

  // 1. Exchange code for tokens
  let tokens;
  try {
    const res = await oauth2Client.getToken(code);
    tokens = res.tokens;
  } catch (error) {
    throw new AppError(
      `Failed to exchange authorization code with Google: ${error.message}`,
      400,
      "OAUTH_EXCHANGE_FAILED"
    );
  }

  const { access_token, refresh_token, expiry_date } = tokens;

  if (!access_token) {
    throw new AppError("Failed to obtain access token from Google.", 502, "PROVIDER_ERROR");
  }

  // Set credentials on oauth client to fetch user profile info
  oauth2Client.setCredentials(tokens);
  const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
  const userinfo = await oauth2.userinfo.get();

  const googleEmail = userinfo.data.email;
  const googleAccountId = userinfo.data.id;

  if (!googleEmail || !googleAccountId) {
    throw new AppError("Could not retrieve Google account identity.", 502, "PROVIDER_ERROR");
  }

  // 2. Check if this Google account is connected to a DIFFERENT Storiva user
  const existingOtherUserAccount = await CloudAccount.findOne({
    provider: "google",
    email: googleEmail.toLowerCase(),
    userId: { $ne: authenticatedUserId },
  });

  if (existingOtherUserAccount) {
    throw new AppError(
      "This Google account is already connected to another Storiva user.",
      409,
      "ACCOUNT_ALREADY_CONNECTED"
    );
  }

  // 3. Encrypt sensitive tokens
  const encryptedAccess = encrypt(access_token);
  const encryptedRefresh = refresh_token ? encrypt(refresh_token) : null;
  const tokenExpiresAt = new Date(expiry_date || Date.now() + 3600 * 1000);

  // 4. Find existing connection for this user or create new CloudAccount
  let cloudAccount = await CloudAccount.findOne({
    userId: authenticatedUserId,
    provider: "google",
    email: googleEmail.toLowerCase(),
  });

  if (cloudAccount) {
    cloudAccount.encryptedAccessToken = encryptedAccess;
    if (encryptedRefresh) {
      cloudAccount.encryptedRefreshToken = encryptedRefresh;
    }
    cloudAccount.tokenExpiresAt = tokenExpiresAt;
    cloudAccount.status = "ACTIVE";
    await cloudAccount.save();
  } else {
    cloudAccount = await CloudAccount.create({
      userId: authenticatedUserId,
      provider: "google",
      providerAccountId: googleAccountId,
      email: googleEmail,
      encryptedAccessToken: encryptedAccess,
      encryptedRefreshToken: encryptedRefresh || encryptedAccess, // Fallback if re-authorizing
      tokenExpiresAt,
      status: "ACTIVE",
    });
  }

  // 5. Initial Storage Quota Sync
  try {
    const provider = new GoogleDriveProvider(cloudAccount);
    await provider.getStorageInfo();
  } catch (err) {
    // Non-blocking error logging for storage sync failure during connect
    console.error("Warning: Initial storage sync failed:", err.message);
  }

  return cloudAccount.toSafeObject();
};

/**
 * List connected cloud accounts for user
 * @param {string} userId
 * @returns {Promise<Array>}
 */
export const getUserCloudAccounts = async (userId) => {
  const accounts = await CloudAccount.find({ userId });
  return accounts.map((acc) => acc.toSafeObject());
};

/**
 * Disconnect a cloud account
 * @param {string} userId
 * @param {string} accountId
 */
export const disconnectCloudAccount = async (userId, accountId) => {
  const account = await CloudAccount.findOne({ _id: accountId, userId });
  if (!account) {
    throw new AppError("Cloud account not found.", 404, "ACCOUNT_NOT_FOUND");
  }

  await CloudAccount.deleteOne({ _id: accountId, userId });
  return true;
};
