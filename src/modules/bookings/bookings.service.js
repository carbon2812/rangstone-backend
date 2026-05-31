const prisma = require("../../config/prisma");
const { AppError } = require("../../utils/errors");
const { bookingCode, ticketNumber } = require("../../utils/codeGenerator");
const {
  assertAgentCanBook,
  createCommissionForBooking,
  approveCommissionTransaction
} = require("../agentManagement/agentManagement.service");

const createPackageBooking = async (user, payload) => {
  const packageDate = await prisma.packageDate.findUnique({
    where: { id: payload.packageDateId },
    include: { package: true }
  });

  if (!packageDate) throw new AppError("Package date not found.", 404);
  if (packageDate.seatsAvailable < payload.seatsBooked) throw new AppError("Not enough seats available.", 400);

  const price = Number(packageDate.package.offerPrice || packageDate.package.price);
  const totalAmount = price * payload.seatsBooked;

  return prisma.$transaction(async (tx) => {
    const agentContext = await assertAgentCanBook({
      user,
      bookingType: "PACKAGE",
      tx
    });

    const booking = await tx.packageBooking.create({
      data: {
        bookingCode: bookingCode("PKG"),
        ticketNumber: ticketNumber(),
        userId: user.id,
        packageDateId: payload.packageDateId,
        referralCode: payload.referralCode || agentContext?.agent?.referralCode,
        seatsBooked: payload.seatsBooked,
        totalAmount
      },
      include: { packageDate: { include: { package: true } } }
    });

    await tx.packageDate.update({
      where: { id: payload.packageDateId },
      data: { seatsAvailable: { decrement: payload.seatsBooked } }
    });

    await createCommissionForBooking({
      agent: agentContext?.agent,
      config: agentContext?.config,
      bookingId: booking.id,
      bookingType: "PACKAGE",
      bookingAmount: totalAmount,
      tx
    });

    return booking;
  });
};

const createHotelBooking = async (user, payload) => {
  const room = await prisma.hotelRoom.findUnique({
    where: { id: payload.roomId },
    include: { hotel: true }
  });

  if (!room) throw new AppError("Hotel room not found.", 404);

  const nights = Math.max(
    1,
    Math.ceil((new Date(payload.checkOutDate) - new Date(payload.checkInDate)) / (24 * 60 * 60 * 1000))
  );

  const totalAmount = Number(room.price) * nights;

  return prisma.$transaction(async (tx) => {
    const agentContext = await assertAgentCanBook({
      user,
      bookingType: "HOTEL",
      tx
    });

    const booking = await tx.hotelBooking.create({
      data: {
        bookingCode: bookingCode("HTL"),
        userId: user.id,
        hotelId: room.hotelId,
        roomId: room.id,
        checkInDate: new Date(payload.checkInDate),
        checkOutDate: new Date(payload.checkOutDate),
        totalAmount
      },
      include: { hotel: true, room: true }
    });

    await createCommissionForBooking({
      agent: agentContext?.agent,
      config: agentContext?.config,
      bookingId: booking.id,
      bookingType: "HOTEL",
      bookingAmount: totalAmount,
      tx
    });

    return booking;
  });
};

const createVehicleBooking = async (user, payload) => {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: payload.vehicleId } });
  if (!vehicle) throw new AppError("Vehicle not found.", 404);

  const start = new Date(payload.startDateTime);
  const end = new Date(payload.endDateTime);
  if (end <= start) throw new AppError("End date/time must be after start date/time.", 400);

  const milliseconds = end.getTime() - start.getTime();
  const units =
    payload.rentalType === "HOURLY"
      ? Math.ceil(milliseconds / (60 * 60 * 1000))
      : Math.ceil(milliseconds / (24 * 60 * 60 * 1000));
  const unitPrice = payload.rentalType === "HOURLY" ? Number(vehicle.pricePerHour) : Number(vehicle.pricePerDay);
  const rentAmount = units * unitPrice;
  const securityDeposit = Number(vehicle.securityDeposit);

  const totalAmount = rentAmount + securityDeposit;
  const bookingType = vehicle.type === "CAR" ? "CAR" : "BIKE";

  return prisma.$transaction(async (tx) => {
    const agentContext = await assertAgentCanBook({
      user,
      bookingType: "VEHICLE",
      vehicleType: vehicle.type,
      tx
    });

    const booking = await tx.vehicleBooking.create({
      data: {
        bookingCode: bookingCode("VEH"),
        userId: user.id,
        vehicleId: vehicle.id,
        pickupLocation: payload.pickupLocation,
        dropLocation: payload.dropLocation,
        startDateTime: start,
        endDateTime: end,
        rentalType: payload.rentalType,
        rentAmount,
        securityDeposit,
        totalAmount,
        cancellationPolicy: payload.cancellationPolicy
      },
      include: { vehicle: true }
    });

    await createCommissionForBooking({
      agent: agentContext?.agent,
      config: agentContext?.config,
      bookingId: booking.id,
      bookingType,
      bookingAmount: totalAmount,
      tx
    });

    return booking;
  });
};

const history = (userId) =>
  Promise.all([
    prisma.packageBooking.findMany({
      where: { userId },
      include: { packageDate: { include: { package: true } } },
      orderBy: { createdAt: "desc" }
    }),
    prisma.hotelBooking.findMany({
      where: { userId },
      include: { hotel: true, room: true },
      orderBy: { createdAt: "desc" }
    }),
    prisma.vehicleBooking.findMany({
      where: { userId },
      include: { vehicle: true },
      orderBy: { createdAt: "desc" }
    })
  ]).then(([packages, hotels, vehicles]) => ({ packages, hotels, vehicles }));

const updatePackageBookingStatus = (id, bookingStatus) =>
  prisma.$transaction(async (tx) => {
    const booking = await tx.packageBooking.update({
      where: { id },
      data: { bookingStatus }
    });

    if (bookingStatus === "CONFIRMED") {
      await approveCommissionTransaction({ bookingId: id, tx });
    }

    return booking;
  });

const cancelPackageBooking = (id) =>
  prisma.packageBooking.update({
    where: { id },
    data: { bookingStatus: "CANCELLED" }
  });

module.exports = {
  createPackageBooking,
  createHotelBooking,
  createVehicleBooking,
  history,
  updatePackageBookingStatus,
  cancelPackageBooking
};
