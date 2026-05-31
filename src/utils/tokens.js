const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const env = require("../config/env");

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const signAccessToken = (user) =>
  jwt.sign(
    {
      sub: user.id,
      role: user.role.name
    },
    env.jwtAccessSecret,
    { expiresIn: env.jwtAccessExpiresIn }
  );

const signRefreshToken = (user) =>
  jwt.sign(
    {
      sub: user.id,
      role: user.role.name,
      type: "refresh"
    },
    env.jwtRefreshSecret,
    { expiresIn: `${env.jwtRefreshExpiresInDays}d` }
  );

const getRefreshExpiry = () =>
  new Date(Date.now() + env.jwtRefreshExpiresInDays * 24 * 60 * 60 * 1000);

module.exports = {
  hashToken,
  signAccessToken,
  signRefreshToken,
  getRefreshExpiry
};
