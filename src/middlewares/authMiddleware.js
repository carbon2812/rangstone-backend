const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");
const env = require("../config/env");
const { AppError } = require("../utils/errors");

const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      throw new AppError("Authentication token is required.", 401);
    }

    const payload = jwt.verify(token, env.jwtAccessSecret);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: { role: true }
    });

    if (!user || user.isBlocked || !user.isActive) {
      throw new AppError("User is not allowed to access this resource.", 401);
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(error.statusCode ? error : new AppError("Invalid or expired token.", 401));
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(new AppError("Authentication is required.", 401));
  }

  if (!roles.includes(req.user.role.name)) {
    return next(new AppError("You do not have permission to perform this action.", 403));
  }

  return next();
};

module.exports = {
  authenticate,
  authorize
};
