const repo = require("./users.repository");
const prisma = require("../../config/prisma");
const { AppError } = require("../../utils/errors");
const { hashPassword } = require("../../utils/password");

const includeRole = { include: { role: true } };

const sanitize = (user) => {
  if (!user) return user;
  const { password, ...safeUser } = user;
  return {
    ...safeUser,
    role: user.role?.name || user.role
  };
};

const list = async () => {
  const users = await repo.findMany({
    include: { role: true },
    orderBy: { createdAt: "desc" }
  });
  return users.map(sanitize);
};

const get = async (id) => sanitize(await repo.findUnique(id, includeRole));

const create = async (payload) => {
  const role = await prisma.role.findUnique({ where: { name: payload.role } });
  if (!role) throw new AppError("Invalid role.", 400);

  const user = await repo.create(
    {
      phoneNumber: payload.phoneNumber,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      password: payload.password ? await hashPassword(payload.password) : undefined,
      roleId: role.id,
      profileRequired: false,
      isNewUser: false
    },
    includeRole
  );

  return sanitize(user);
};

const update = async (id, payload) => {
  const data = { ...payload };
  if (payload.password) data.password = await hashPassword(payload.password);
  delete data.role;

  if (payload.role) {
    const role = await prisma.role.findUnique({ where: { name: payload.role } });
    if (!role) throw new AppError("Invalid role.", 400);
    data.roleId = role.id;
  }

  return sanitize(await repo.update(id, data, includeRole));
};

const remove = (id) => repo.delete(id);

const block = (id, isBlocked) => update(id, { isBlocked });

const activityLogs = (userId) =>
  prisma.activityLog.findMany({
    where: userId ? { userId } : undefined,
    orderBy: { createdAt: "desc" },
    take: 100
  });

module.exports = {
  list,
  get,
  create,
  update,
  remove,
  block,
  activityLogs
};
