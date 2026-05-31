const prisma = require("../../config/prisma");

const findUserByPhone = (phoneNumber) =>
  prisma.user.findUnique({
    where: { phoneNumber },
    include: { role: true }
  });

const findUserById = (id) =>
  prisma.user.findUnique({
    where: { id },
    include: { role: true }
  });

const findRoleByName = (name) => prisma.role.findUnique({ where: { name } });

const createUser = (data) =>
  prisma.user.create({
    data,
    include: { role: true }
  });

const updateUser = (id, data) =>
  prisma.user.update({
    where: { id },
    data,
    include: { role: true }
  });

const createRefreshToken = (data) => prisma.refreshToken.create({ data });

const findRefreshToken = (tokenHash) =>
  prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: { include: { role: true } } }
  });

const revokeRefreshToken = (id, data = {}) =>
  prisma.refreshToken.update({
    where: { id },
    data: {
      revokedAt: new Date(),
      ...data
    }
  });

module.exports = {
  findUserByPhone,
  findUserById,
  findRoleByName,
  createUser,
  updateUser,
  createRefreshToken,
  findRefreshToken,
  revokeRefreshToken
};
