const prisma = require("../../config/prisma");
const { referralCode } = require("../../utils/codeGenerator");
const { ensureAgentDefaults } = require("../agentManagement/agentManagement.service");

const upsertProfile = ({ userId, commissionRate, payoutDetails }) =>
  prisma.$transaction(async (tx) => {
    const agent = await tx.agent.upsert({
    where: { userId },
    create: {
      userId,
      referralCode: referralCode(userId),
      commissionRate,
      payoutDetails
    },
    update: {
      commissionRate,
      payoutDetails
    },
    include: { user: true }
  });

    await ensureAgentDefaults(agent.id, tx);
    return agent;
  });

const getProfile = (userId) =>
  prisma.agent.findUnique({
    where: { userId },
    include: {
      commissionTransactions: true,
      payouts: true,
      permissions: true,
      commissionRule: true,
      wallet: true
    }
  });

const commissions = (userId) =>
  prisma.agent
    .findUnique({
      where: { userId },
      include: { commissionTransactions: { orderBy: { createdAt: "desc" } } }
    })
    .then((agent) => agent?.commissionTransactions || []);

const calculateMonthlyPayout = async (userId, period) => {
  const agent = await prisma.agent.findUnique({
    where: { userId },
    include: { commissionTransactions: { where: { status: "APPROVED" } } }
  });

  const amount = (agent?.commissionTransactions || []).reduce((sum, item) => sum + Number(item.earnedAmount), 0);

  return prisma.agentPayout.create({
    data: {
      agentId: agent.id,
      amount,
      payoutMonth: period,
      payoutStatus: "PENDING"
    }
  });
};

const updatePayoutStatus = (id, status) =>
  prisma.agentPayout.update({
    where: { id },
    data: { payoutStatus: status, paidAt: status === "PAID" ? new Date() : undefined }
  });

module.exports = {
  upsertProfile,
  getProfile,
  commissions,
  calculateMonthlyPayout,
  updatePayoutStatus
};
