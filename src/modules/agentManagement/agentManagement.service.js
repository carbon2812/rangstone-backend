const prisma = require("../../config/prisma");
const repo = require("./agentManagement.repository");
const { AppError } = require("../../utils/errors");

const defaultPermissions = {
  canBookPackages: false,
  canBookHotels: false,
  canBookCars: false,
  canBookBikes: false
};

const defaultCommissionRule = {
  packageCommissionType: "PERCENTAGE",
  packageCommissionValue: 0,
  hotelCommissionType: "PERCENTAGE",
  hotelCommissionValue: 0,
  carCommissionType: "PERCENTAGE",
  carCommissionValue: 0,
  bikeCommissionType: "PERCENTAGE",
  bikeCommissionValue: 0
};

const ensureAgentDefaults = async (agentId, tx = prisma) => {
  await repo.upsertPermissions(agentId, defaultPermissions, tx);
  await repo.upsertCommissionRule(agentId, defaultCommissionRule, tx);
  await repo.upsertWallet(agentId, {}, tx);
};

const ensureAgentForUser = async (userId, tx = prisma) => {
  const agent = await tx.agent.findUnique({
    where: { userId },
    include: {
      permissions: true,
      commissionRule: true,
      wallet: true
    }
  });

  if (!agent) {
    throw new AppError("Agent profile not found.", 404);
  }

  await ensureAgentDefaults(agent.id, tx);

  return tx.agent.findUnique({
    where: { id: agent.id },
    include: {
      permissions: true,
      commissionRule: true,
      wallet: true
    }
  });
};

const getAgentOrThrow = async (id) => {
  const agent = await repo.getAgent(id);
  if (!agent) throw new AppError("Agent not found.", 404);
  await ensureAgentDefaults(agent.id);
  return repo.getAgent(id);
};

const listAgents = async () => {
  const agents = await repo.listAgents();
  await Promise.all(agents.map((agent) => ensureAgentDefaults(agent.id)));
  return repo.listAgents();
};

const getAgent = (id) => getAgentOrThrow(id);

const getPermissions = async (id) => (await getAgentOrThrow(id)).permissions;

const updatePermissions = async (id, data) => {
  await getAgentOrThrow(id);
  return repo.upsertPermissions(id, data);
};

const getCommissionRules = async (id) => (await getAgentOrThrow(id)).commissionRule;

const updateCommissionRules = async (id, data) => {
  await getAgentOrThrow(id);
  return repo.upsertCommissionRule(id, data);
};

const getWallet = async (id) => (await getAgentOrThrow(id)).wallet;

const getTransactions = async (id) => {
  await getAgentOrThrow(id);
  return prisma.agentCommissionTransaction.findMany({
    where: { agentId: id },
    orderBy: { createdAt: "desc" }
  });
};

const listPayouts = (status) =>
  prisma.agentPayout.findMany({
    where: status ? { payoutStatus: status } : undefined,
    include: { agent: { include: { user: true } } },
    orderBy: { createdAt: "desc" }
  });

const createPayout = async ({ agentId, amount, payoutMonth, remarks }) => {
  await getAgentOrThrow(agentId);

  return prisma.$transaction(async (tx) => {
    const wallet = await tx.agentWallet.findUnique({ where: { agentId } });
    const payoutAmount = Number(amount);

    if (!wallet || Number(wallet.availableBalance) < payoutAmount) {
      throw new AppError("Insufficient available balance for payout.", 400);
    }

    return tx.agentPayout.create({
      data: {
        agentId,
        amount: payoutAmount,
        payoutMonth,
        remarks,
        payoutStatus: "PENDING"
      }
    });
  });
};

const approvePayout = async (id, remarks) =>
  prisma.agentPayout.update({
    where: { id },
    data: {
      payoutStatus: "PROCESSING",
      remarks
    }
  });

const payPayout = async (id, remarks) =>
  prisma.$transaction(async (tx) => {
    const payout = await tx.agentPayout.findUnique({ where: { id } });
    if (!payout) throw new AppError("Payout not found.", 404);
    if (payout.payoutStatus === "PAID") throw new AppError("Payout is already paid.", 400);

    const amount = Number(payout.amount);

    await tx.agentPayout.update({
      where: { id },
      data: {
        payoutStatus: "PAID",
        remarks,
        paidAt: new Date()
      }
    });

    await tx.agentWallet.update({
      where: { agentId: payout.agentId },
      data: {
        paidAmount: { increment: amount },
        availableBalance: { decrement: amount }
      }
    });

    await tx.agentCommissionTransaction.updateMany({
      where: {
        agentId: payout.agentId,
        status: "APPROVED"
      },
      data: { status: "PAID" }
    });

    return tx.agentPayout.findUnique({ where: { id } });
  });

const calculateCommission = ({ bookingAmount, commissionType, commissionValue }) => {
  const amount = Number(bookingAmount);
  const value = Number(commissionValue);
  return commissionType === "PERCENTAGE" ? (amount * value) / 100 : value;
};

const getServiceConfig = (bookingType, vehicleType) => {
  if (bookingType === "PACKAGE") {
    return {
      permissionKey: "canBookPackages",
      typeKey: "packageCommissionType",
      valueKey: "packageCommissionValue",
      deniedMessage: "You do not have permission to create travel package bookings."
    };
  }

  if (bookingType === "HOTEL") {
    return {
      permissionKey: "canBookHotels",
      typeKey: "hotelCommissionType",
      valueKey: "hotelCommissionValue",
      deniedMessage: "You do not have permission to create hotel bookings."
    };
  }

  if (vehicleType === "CAR") {
    return {
      permissionKey: "canBookCars",
      typeKey: "carCommissionType",
      valueKey: "carCommissionValue",
      deniedMessage: "You do not have permission to create car rental bookings."
    };
  }

  return {
    permissionKey: "canBookBikes",
    typeKey: "bikeCommissionType",
    valueKey: "bikeCommissionValue",
    deniedMessage: "You do not have permission to create bike/scooter rental bookings."
  };
};

const assertAgentCanBook = async ({ user, bookingType, vehicleType, tx = prisma }) => {
  if (user.role.name !== "AGENT_VENDOR") return null;

  const agent = await ensureAgentForUser(user.id, tx);
  const config = getServiceConfig(bookingType, vehicleType);

  if (!agent.permissions?.[config.permissionKey]) {
    throw new AppError(config.deniedMessage, 403);
  }

  return { agent, config };
};

const createCommissionForBooking = async ({
  agent,
  config,
  bookingId,
  bookingType,
  bookingAmount,
  tx = prisma
}) => {
  if (!agent || !config) return null;

  const commissionType = agent.commissionRule[config.typeKey];
  const commissionValue = Number(agent.commissionRule[config.valueKey]);
  const earnedAmount = calculateCommission({ bookingAmount, commissionType, commissionValue });

  const transaction = await tx.agentCommissionTransaction.create({
    data: {
      agentId: agent.id,
      bookingId,
      bookingType,
      bookingAmount,
      commissionType,
      commissionValue,
      earnedAmount,
      status: "PENDING"
    }
  });

  await tx.agentWallet.update({
    where: { agentId: agent.id },
    data: {
      totalEarned: { increment: earnedAmount },
      pendingAmount: { increment: earnedAmount }
    }
  });

  return transaction;
};

const approveCommissionTransaction = async ({ bookingId, tx = prisma }) => {
  const transaction = await tx.agentCommissionTransaction.findFirst({
    where: { bookingId, status: "PENDING" }
  });

  if (!transaction) return null;

  await tx.agentCommissionTransaction.update({
    where: { id: transaction.id },
    data: { status: "APPROVED" }
  });

  await tx.agentWallet.update({
    where: { agentId: transaction.agentId },
    data: {
      pendingAmount: { decrement: transaction.earnedAmount },
      availableBalance: { increment: transaction.earnedAmount }
    }
  });

  return transaction;
};

const agentDashboard = async (userId) => {
  const agent = await ensureAgentForUser(userId);

  const [packageBookings, hotelBookings, vehicleBookings, transactions, payouts] = await Promise.all([
    prisma.packageBooking.count({ where: { userId } }),
    prisma.hotelBooking.count({ where: { userId } }),
    prisma.vehicleBooking.findMany({ where: { userId }, include: { vehicle: true } }),
    prisma.agentCommissionTransaction.findMany({ where: { agentId: agent.id } }),
    prisma.agentPayout.findMany({ where: { agentId: agent.id }, orderBy: { createdAt: "desc" } })
  ]);

  const carRentals = vehicleBookings.filter((booking) => booking.vehicle.type === "CAR").length;
  const bikeRentals = vehicleBookings.filter((booking) => ["BIKE", "SCOOTER"].includes(booking.vehicle.type)).length;

  return {
    totalBookings: packageBookings + hotelBookings + vehicleBookings.length,
    packageBookings,
    hotelBookings,
    carRentals,
    bikeRentals,
    totalCommissionEarned: Number(agent.wallet.totalEarned),
    pendingCommission: Number(agent.wallet.pendingAmount),
    paidCommission: Number(agent.wallet.paidAmount),
    availableBalance: Number(agent.wallet.availableBalance),
    recentPayouts: payouts.slice(0, 5),
    recentCommissions: transactions.slice(0, 5)
  };
};

const agentWallet = async (userId) => (await ensureAgentForUser(userId)).wallet;

const agentCommissionHistory = async (userId) => {
  const agent = await ensureAgentForUser(userId);
  return prisma.agentCommissionTransaction.findMany({
    where: { agentId: agent.id },
    orderBy: { createdAt: "desc" }
  });
};

const agentPayoutHistory = async (userId) => {
  const agent = await ensureAgentForUser(userId);
  return prisma.agentPayout.findMany({
    where: { agentId: agent.id },
    orderBy: { createdAt: "desc" }
  });
};

const adminMetrics = async () => {
  const [totalAgents, activeAgents, pendingPayouts, paidPayouts, transactions, agents] = await Promise.all([
    prisma.agent.count(),
    prisma.agent.count({ where: { user: { is: { isActive: true, isBlocked: false } } } }),
    prisma.agentPayout.aggregate({ where: { payoutStatus: { in: ["PENDING", "PROCESSING"] } }, _sum: { amount: true } }),
    prisma.agentPayout.aggregate({ where: { payoutStatus: "PAID" }, _sum: { amount: true } }),
    prisma.agentCommissionTransaction.findMany(),
    prisma.agent.findMany({
      include: {
        user: true,
        wallet: true
      }
    })
  ]);

  return {
    totalAgents,
    activeAgents,
    pendingPayouts: Number(pendingPayouts._sum.amount || 0),
    paidPayouts: Number(paidPayouts._sum.amount || 0),
    commissionRevenueReport: {
      totalCommission: transactions.reduce((sum, item) => sum + Number(item.earnedAmount), 0),
      pendingCommission: transactions
        .filter((item) => item.status === "PENDING")
        .reduce((sum, item) => sum + Number(item.earnedAmount), 0),
      approvedCommission: transactions
        .filter((item) => item.status === "APPROVED")
        .reduce((sum, item) => sum + Number(item.earnedAmount), 0),
      paidCommission: transactions
        .filter((item) => item.status === "PAID")
        .reduce((sum, item) => sum + Number(item.earnedAmount), 0)
    },
    topPerformingAgents: agents
      .sort((a, b) => Number(b.wallet?.totalEarned || 0) - Number(a.wallet?.totalEarned || 0))
      .slice(0, 10)
  };
};

module.exports = {
  ensureAgentDefaults,
  ensureAgentForUser,
  listAgents,
  getAgent,
  getPermissions,
  updatePermissions,
  getCommissionRules,
  updateCommissionRules,
  getWallet,
  getTransactions,
  listPayouts,
  createPayout,
  approvePayout,
  payPayout,
  assertAgentCanBook,
  createCommissionForBooking,
  approveCommissionTransaction,
  agentDashboard,
  agentWallet,
  agentCommissionHistory,
  agentPayoutHistory,
  adminMetrics
};
