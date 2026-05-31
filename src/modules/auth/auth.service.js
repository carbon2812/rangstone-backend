const jwt = require("jsonwebtoken");
const repo = require("./auth.repository");
const env = require("../../config/env");
const {
  createAndSendOtp,
  verifyStoredOtp,
  normalizePhone
} = require("../../services/otpService");
const { AppError } = require("../../utils/errors");
const { hashPassword, comparePassword } = require("../../utils/password");
const {
  hashToken,
  signAccessToken,
  signRefreshToken,
  getRefreshExpiry
} = require("../../utils/tokens");

const publicUser = (user) => ({
  id: user.id,
  phoneNumber: user.phoneNumber,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  profilePicture: user.profilePicture,
  role: user.role.name,
  profileRequired: user.profileRequired,
  isNewUser: user.isNewUser,
  isBlocked: user.isBlocked
});

const issueTokens = async (user) => {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  await repo.createRefreshToken({
    tokenHash: hashToken(refreshToken),
    userId: user.id,
    expiresAt: getRefreshExpiry()
  });

  return { accessToken, refreshToken };
};

const sendOtp = async (phone) => {
  const phoneNumber = normalizePhone(phone);
  await createAndSendOtp(phoneNumber);
  const user = await repo.findUserByPhone(phoneNumber);

  return {
    isExistingUser: Boolean(user),
    profileRequired: user ? user.profileRequired : true
  };
};

const verifyOtp = async ({ phone, otp }) => {
  const phoneNumber = normalizePhone(phone);
  await verifyStoredOtp({ phone: phoneNumber, otp });

  let user = await repo.findUserByPhone(phoneNumber);

  if (!user) {
    const customerRole = await repo.findRoleByName("CUSTOMER");
    if (!customerRole) throw new AppError("Default CUSTOMER role is not seeded.", 500);

    user = await repo.createUser({
      phoneNumber,
      roleId: customerRole.id,
      isNewUser: true,
      profileRequired: true
    });
  }

  if (user.isBlocked) {
    throw new AppError("Your account is blocked.", 403);
  }

  const tokens = await issueTokens(user);

  return {
    ...tokens,
    profileRequired: user.profileRequired,
    user: publicUser(user)
  };
};

const register = async (payload) => {
  const phoneNumber = normalizePhone(payload.phoneNumber);
  const existing = await repo.findUserByPhone(phoneNumber);
  if (existing && !existing.profileRequired) {
    throw new AppError("User already registered.", 409);
  }

  const roleName = payload.role || "CUSTOMER";
  const role = await repo.findRoleByName(roleName);
  if (!role) throw new AppError("Invalid role.", 400);

  const data = {
    phoneNumber,
    email: payload.email,
    firstName: payload.firstName,
    lastName: payload.lastName,
    password: payload.password ? await hashPassword(payload.password) : undefined,
    roleId: role.id,
    isNewUser: false,
    profileRequired: false
  };

  const user = existing ? await repo.updateUser(existing.id, data) : await repo.createUser(data);
  const tokens = await issueTokens(user);

  return {
    ...tokens,
    user: publicUser(user)
  };
};

const login = async ({ phoneNumber, password }) => {
  const user = await repo.findUserByPhone(normalizePhone(phoneNumber));

  if (!user || !(await comparePassword(password, user.password))) {
    throw new AppError("Invalid phone number or password.", 401);
  }

  if (user.isBlocked) {
    throw new AppError("Your account is blocked.", 403);
  }

  const tokens = await issueTokens(user);
  return {
    ...tokens,
    user: publicUser(user)
  };
};

const refresh = async (refreshToken) => {
  let payload;
  try {
    payload = jwt.verify(refreshToken, env.jwtRefreshSecret);
  } catch (error) {
    throw new AppError("Invalid or expired refresh token.", 401);
  }

  if (payload.type !== "refresh") {
    throw new AppError("Invalid refresh token.", 401);
  }

  const savedToken = await repo.findRefreshToken(hashToken(refreshToken));
  if (!savedToken || savedToken.revokedAt || savedToken.expiresAt.getTime() < Date.now()) {
    throw new AppError("Refresh token has been revoked or expired.", 401);
  }

  const user = savedToken.user;
  const accessToken = signAccessToken(user);
  const newRefreshToken = signRefreshToken(user);

  await repo.revokeRefreshToken(savedToken.id, {
    replacedByToken: hashToken(newRefreshToken)
  });
  await repo.createRefreshToken({
    tokenHash: hashToken(newRefreshToken),
    userId: user.id,
    expiresAt: getRefreshExpiry()
  });

  return {
    accessToken,
    refreshToken: newRefreshToken,
    user: publicUser(user)
  };
};

const logout = async (refreshToken) => {
  const savedToken = await repo.findRefreshToken(hashToken(refreshToken));
  if (savedToken && !savedToken.revokedAt) {
    await repo.revokeRefreshToken(savedToken.id);
  }
};

const getProfile = (user) => publicUser(user);

const checkUser = async (phone) => {
  const user = await repo.findUserByPhone(normalizePhone(phone));
  return {
    isExistingUser: Boolean(user),
    profileRequired: user ? user.profileRequired : true
  };
};

module.exports = {
  sendOtp,
  verifyOtp,
  register,
  login,
  refresh,
  logout,
  getProfile,
  checkUser
};
