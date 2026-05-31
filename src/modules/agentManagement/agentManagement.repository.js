const prisma = require("../../config/prisma");

const includeAgentDetails = {
  user: { include: { role: true } },
  permissions: true,
  commissionRule: true,
  wallet: true
};

const listAgents = () =>
  prisma.agent.findMany({
    include: includeAgentDetails,
    orderBy: { createdAt: "desc" }
  });

const getAgent = (id) =>
  prisma.agent.findUnique({
    where: { id },
    include: includeAgentDetails
  });

const getAgentByUserId = (userId) =>
  prisma.agent.findUnique({
    where: { userId },
    include: includeAgentDetails
  });

const upsertPermissions = (agentId, data, tx = prisma) =>
  tx.agentPermission.upsert({
    where: { agentId },
    create: { agentId, ...data },
    update: data
  });

const upsertCommissionRule = (agentId, data, tx = prisma) =>
  tx.agentCommissionRule.upsert({
    where: { agentId },
    create: { agentId, ...data },
    update: data
  });

const upsertWallet = (agentId, data = {}, tx = prisma) =>
  tx.agentWallet.upsert({
    where: { agentId },
    create: { agentId, ...data },
    update: data
  });

module.exports = {
  includeAgentDetails,
  listAgents,
  getAgent,
  getAgentByUserId,
  upsertPermissions,
  upsertCommissionRule,
  upsertWallet
};
