import { User } from "../users/user.model.js";
import { AppError } from "../../utils/AppError.js";
import { generateToken } from "../../utils/token.js";

/**
 * Register a new Storiva user account
 * @param {object} userData - { name, email, password }
 * @returns {Promise<{ user: object, token: string }>}
 */
export const registerUser = async ({ name, email, password }) => {
  // Check if an account already exists with this email
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new AppError(
      "An account with this email already exists.",
      409,
      "EMAIL_ALREADY_EXISTS"
    );
  }

  // Create user record (password is automatically hashed by Mongoose pre-save hook)
  const user = await User.create({
    name,
    email,
    passwordHash: password,
  });

  const token = generateToken(user._id);

  return {
    user: user.toSafeObject(),
    token,
  };
};

/**
 * Authenticate an existing user by email and password
 * @param {object} credentials - { email, password }
 * @returns {Promise<{ user: object, token: string }>}
 */
export const loginUser = async ({ email, password }) => {
  // Find user and explicitly select passwordHash
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+passwordHash"
  );

  if (!user) {
    throw new AppError(
      "Invalid email or password.",
      401,
      "INVALID_CREDENTIALS"
    );
  }

  // Verify candidate password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError(
      "Invalid email or password.",
      401,
      "INVALID_CREDENTIALS"
    );
  }

  const token = generateToken(user._id);

  return {
    user: user.toSafeObject(),
    token,
  };
};

/**
 * Get profile data of authenticated user
 * @param {string} userId
 * @returns {Promise<object>}
 */
export const getUserProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found.", 404, "USER_NOT_FOUND");
  }

  return user.toSafeObject();
};
