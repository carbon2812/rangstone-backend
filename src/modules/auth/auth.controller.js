const service = require("./auth.service");
const asyncHandler = require("../../utils/asyncHandler");
const { success } = require("../../utils/apiResponse");

const sendOtp = asyncHandler(async (req, res) => {
  const data = await service.sendOtp(req.body.phone);
  return success(res, "OTP sent successfully", data);
});

const verifyOtp = asyncHandler(async (req, res) => {
  const data = await service.verifyOtp(req.body);
  return success(res, "OTP verified successfully", data);
});

const register = asyncHandler(async (req, res) => {
  const data = await service.register(req.body);
  return success(res, "User registered successfully", data, 201);
});

const login = asyncHandler(async (req, res) => {
  const data = await service.login(req.body);
  return success(res, "Login successful", data);
});

const refresh = asyncHandler(async (req, res) => {
  const data = await service.refresh(req.body.refreshToken);
  return success(res, "Token refreshed successfully", data);
});

const logout = asyncHandler(async (req, res) => {
  await service.logout(req.body.refreshToken);
  return success(res, "Logout successful");
});

const profile = asyncHandler(async (req, res) => {
  return success(res, "Profile fetched successfully", service.getProfile(req.user));
});

const checkUser = asyncHandler(async (req, res) => {
  const data = await service.checkUser(req.body.phone);
  return success(res, "User status fetched successfully", data);
});

module.exports = {
  sendOtp,
  verifyOtp,
  register,
  login,
  refresh,
  logout,
  profile,
  checkUser
};
