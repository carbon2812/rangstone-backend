const prisma = require("../../config/prisma");

const sumAmount = (items) => items._sum.totalAmount || 0;

const overview = async () => {
  const [
    totalUsers,
    packageBookings,
    hotelBookings,
    vehicleBookings,
    packageRevenue,
    hotelRevenue,
    vehicleRevenue,
    pendingPayouts,
    activePackages,
    activeHotels,
    activeVehicles,
    recentPackageBookings,
    recentHotelBookings,
    recentVehicleBookings
  ] = await Promise.all([
    prisma.user.count(),
    prisma.packageBooking.count(),
    prisma.hotelBooking.count(),
    prisma.vehicleBooking.count(),
    prisma.packageBooking.aggregate({ _sum: { totalAmount: true }, where: { paymentStatus: "PAID" } }),
    prisma.hotelBooking.aggregate({ _sum: { totalAmount: true }, where: { paymentStatus: "PAID" } }),
    prisma.vehicleBooking.aggregate({ _sum: { totalAmount: true }, where: { paymentStatus: "PAID" } }),
    prisma.agentPayout.aggregate({ _sum: { amount: true }, where: { status: { in: ["PENDING", "PROCESSING"] } } }),
    prisma.package.count({ where: { status: "ACTIVE" } }),
    prisma.hotel.count({ where: { status: "ACTIVE" } }),
    prisma.vehicle.count({ where: { availability: "AVAILABLE" } }),
    prisma.packageBooking.findMany({ take: 5, orderBy: { createdAt: "desc" } }),
    prisma.hotelBooking.findMany({ take: 5, orderBy: { createdAt: "desc" } }),
    prisma.vehicleBooking.findMany({ take: 5, orderBy: { createdAt: "desc" } })
  ]);

  const packageBookingRevenue = Number(sumAmount(packageRevenue));
  const hotelBookingRevenue = Number(sumAmount(hotelRevenue));
  const vehicleBookingRevenue = Number(sumAmount(vehicleRevenue));

  return {
    totalUsers,
    totalBookings: packageBookings + hotelBookings + vehicleBookings,
    totalRevenue: packageBookingRevenue + hotelBookingRevenue + vehicleBookingRevenue,
    packageBookingRevenue,
    hotelBookingRevenue,
    vehicleBookingRevenue,
    pendingPayouts: Number(pendingPayouts._sum.amount || 0),
    activePackages,
    activeHotels,
    activeVehicles,
    recentBookings: {
      packages: recentPackageBookings,
      hotels: recentHotelBookings,
      vehicles: recentVehicleBookings
    }
  };
};

const revenueGraph = async () => {
  const [packages, hotels, vehicles] = await Promise.all([
    prisma.packageBooking.findMany({ where: { paymentStatus: "PAID" }, select: { totalAmount: true, createdAt: true } }),
    prisma.hotelBooking.findMany({ where: { paymentStatus: "PAID" }, select: { totalAmount: true, createdAt: true } }),
    prisma.vehicleBooking.findMany({ where: { paymentStatus: "PAID" }, select: { totalAmount: true, createdAt: true } })
  ]);

  const buckets = {};
  for (const item of [...packages, ...hotels, ...vehicles]) {
    const day = item.createdAt.toISOString().slice(0, 10);
    buckets[day] = (buckets[day] || 0) + Number(item.totalAmount);
  }

  return Object.entries(buckets)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, revenue]) => ({ date, revenue }));
};

module.exports = {
  overview,
  revenueGraph
};
