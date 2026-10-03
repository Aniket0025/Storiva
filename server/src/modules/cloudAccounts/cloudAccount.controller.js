import * as cloudAccountService from "./cloudAccount.service.js";
import { env } from "../../config/env.js";
import { AppError } from "../../utils/AppError.js";

/**
 * Initiate Google OAuth Connect Flow
 */
export const initiateGoogleConnect = async (req, res, next) => {
  try {
    const { url, state } = cloudAccountService.getGoogleAuthUrl(req.user.id);

    // Save OAuth state in HTTP-Only cookie for CSRF validation during callback
    res.cookie("oauth_state", state, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 10 * 60 * 1000, // 10 minutes
    });

    res.status(200).json({
      success: true,
      data: {
        url,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle Google OAuth Callback
 */
export const handleGoogleCallback = async (req, res, next) => {
  try {
    const { code, state, error: googleError } = req.query;

    if (googleError) {
      throw new AppError(`Google OAuth access denied: ${googleError}`, 400, "OAUTH_ACCESS_DENIED");
    }

    // CSRF Protection: Validate state cookie match
    const savedState = req.cookies?.oauth_state;
    res.clearCookie("oauth_state");

    if (!state || !savedState || state !== savedState) {
      throw new AppError("Invalid or expired OAuth state parameter.", 403, "INVALID_OAUTH_STATE");
    }

    // Decode state to retrieve original userId
    let statePayload;
    try {
      statePayload = JSON.parse(Buffer.from(state, "base64url").toString("utf8"));
    } catch (err) {
      throw new AppError("Malformed OAuth state payload.", 400, "INVALID_OAUTH_STATE");
    }

    const userId = req.user?.id || statePayload.userId;

    if (!userId) {
      throw new AppError("Authentication required for Google account connection.", 401, "UNAUTHORIZED");
    }

    const account = await cloudAccountService.handleGoogleOAuthCallback(userId, code);

    // If request comes from standard browser redirect, redirect to frontend dashboard
    if (req.accepts("html")) {
      return res.redirect(`${env.CLIENT_URL}?connect=success&email=${encodeURIComponent(account.email)}`);
    }

    res.status(200).json({
      success: true,
      data: {
        account,
      },
    });
  } catch (error) {
    if (req.accepts("html")) {
      return res.redirect(`${env.CLIENT_URL}?connect=error&message=${encodeURIComponent(error.message)}`);
    }
    next(error);
  }
};

/**
 * Get All Connected Cloud Accounts for User
 */
export const getAccounts = async (req, res, next) => {
  try {
    const accounts = await cloudAccountService.getUserCloudAccounts(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        accounts,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Disconnect a Connected Cloud Account
 */
export const disconnectAccount = async (req, res, next) => {
  try {
    await cloudAccountService.disconnectCloudAccount(req.user.id, req.params.id);

    res.status(200).json({
      success: true,
      data: {
        message: "Cloud account disconnected successfully",
      },
    });
  } catch (error) {
    next(error);
  }
};
