const prisma = require("../../config/prisma");
const { AppError } = require("../../utils/errors");
const { bookingCode, ticketNumber } = require("../../utils/codeGenerator");

const createPackageBooking = async (userId, payload) => {
  const packageDate = await prisma.packageDate.findUnique({
    where: { id: payload.packageDateId },
    include: { package: true }
  });

  if (!packageDate) throw new AppError("Package date not found.", 404);
  if (packageDate.seatsAvailable < payload.seatsBooked) throw new AppError("Not enough seats available.", 400);

  const price = Number(packageDate.package.offerPrice || packageDate.package.price);
  const totalAmount = price * payload.seatsBooked;

  return prisma.$transaction(async (tx) => {
    const booking = await tx.packageBooking.create({
      data: {
        bookingCode: bookingCode("PKG"),
        ticketNumber: ticketNumber(),
        userId,
        packageDateId: payload.packageDateId,
        referralCode: payload.referralCode,
        seatsBooked: payload.seatsBooked,
        totalAmount
      },
      include: { packageDate: { include: { package: true } } }
    });

    await tx.packageDate.update({
      where: { id: payload.packageDateId },
      data: { seatsAvailable: { decrement: payload.seatsBooked } }
    });

    if (payload.referralCode) {
      const agent = await tx.agent.findUnique({ where: { referralCode: payload.referralCode } });
      if (agent) {
        await tx.agentCommission.create({
          data: {
            agentId: agent.id,
            bookingId: booking.id,
            bookingType: "PACKAGE",
            amount: totalAmount * Number(agent.commissionRate)
          }
        });
      }
    }

    return booking;
  });
};

const createHotelBooking = async (userId, payload) => {
  const room = await prisma.hotelRoom.findUnique({
    where: { id: payload.roomId },
    include: { hotel: true }
  });

  if (!room) throw new AppError("Hotel room not found.", 404);

  const nights = Math.max(
    1,
    Math.ceil((new Date(payload.checkOutDate) - new Date(payload.checkInDate)) / (24 * 60 * 60 * 1000))
  );

  return prisma.hotelBooking.create({
    data: {
      bookingCode: bookingCode("HTL"),
      userId,
      hotelId: room.hotelId,
      roomId: room.id,
      checkInDate: new Date(payload.checkInDate),
      checkOutDate: new Date(payload.checkOutDate),
      totalAmount: Number(room.price) * nights
    },
    include: { hotel: true, room: true }
  });
};

const createVehicleBooking = async (userId, payload) => {
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

  return prisma.vehicleBooking.create({
    data: {
      bookingCode: bookingCode("VEH"),
      userId,
      vehicleId: vehicle.id,
      pickupLocation: payload.pickupLocation,
      dropLocation: payload.dropLocation,
      startDateTime: start,
      endDateTime: end,
      rentalType: payload.rentalType,
      rentAmount,
      securityDeposit,
      totalAmount: rentAmount + securityDeposit,
      cancellationPolicy: payload.cancellationPolicy
    },
    include: { vehicle: true }
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
  prisma.packageBooking.update({
    where: { id },
    data: { bookingStatus }
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
