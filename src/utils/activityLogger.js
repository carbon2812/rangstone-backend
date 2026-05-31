const prisma = require("../config/prisma");

const logActivity = async ({ userId, action, module, details, req }) => {
  await prisma.activityLog.create({
    data: {
      userId,
      action,
      module,
      details,
      ipAddress: req?.ip,
      userAgent: req?.headers?.["user-agent"]
    }
  });
};

module.exports = {
  logActivity
};
