const prisma = require("../../config/prisma");
const { referralCode } = require("../../utils/codeGenerator");

const upsertProfile = ({ userId, commissionRate, payoutDetails }) =>
  prisma.agent.upsert({
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

const getProfile = (userId) =>
  prisma.agent.findUnique({
    where: { userId },
    include: { commissions: true, payouts: true }
  });

const commissions = (userId) =>
  prisma.agent
    .findUnique({
      where: { userId },
      include: { commissions: { orderBy: { createdAt: "desc" } } }
    })
    .then((agent) => agent?.commissions || []);

const calculateMonthlyPayout = async (userId, period) => {
  const agent = await prisma.agent.findUnique({
    where: { userId },
    include: { commissions: { where: { status: "pending" } } }
  });

  const amount = (agent?.commissions || []).reduce((sum, item) => sum + Number(item.amount), 0);

  return prisma.agentPayout.create({
    data: {
      agentId: agent.id,
      amount,
      period,
      status: "PENDING"
    }
  });
};

const updatePayoutStatus = (id, status) =>
  prisma.agentPayout.update({
    where: { id },
    data: { status, paidAt: status === "PAID" ? new Date() : undefined }
  });

module.exports = {
  upsertProfile,
  getProfile,
  commissions,
  calculateMonthlyPayout,
  updatePayoutStatus
};
