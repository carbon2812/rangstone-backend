const prisma = require("../../config/prisma");
const { AppError } = require("../../utils/errors");

const createProfile = async ({ userId, licenseNumber, experienceYears }) => {
  const profile = await prisma.captain.upsert({
    where: { userId },
    create: { userId, licenseNumber, experienceYears },
    update: { licenseNumber, experienceYears },
    include: { user: { include: { role: true } } }
  });
  return profile;
};

const assignedTrips = (userId) =>
  prisma.captain
    .findUnique({
      where: { userId },
      include: {
        assignedPackageDates: {
          include: {
            package: true,
            bookings: { include: { user: true } }
          }
        }
      }
    })
    .then((captain) => captain?.assignedPackageDates || []);

const verifyTicket = async (userId, { bookingCode, status }) => {
  const captain = await prisma.captain.findUnique({ where: { userId } });
  if (!captain) throw new AppError("Captain profile not found.", 404);

  const booking = await prisma.packageBooking.findUnique({
    where: { bookingCode },
    include: { packageDate: true }
  });
  if (!booking) throw new AppError("Ticket not found.", 404);
  if (booking.packageDate.captainId !== captain.id) throw new AppError("Ticket is not assigned to this captain.", 403);

  return prisma.ticketVerification.upsert({
    where: {
      bookingId_captainId: {
        bookingId: booking.id,
        captainId: captain.id
      }
    },
    create: {
      bookingId: booking.id,
      captainId: captain.id,
      status
    },
    update: {
      status,
      verifiedAt: new Date()
    },
    include: { booking: true }
  });
};

module.exports = {
  createProfile,
  assignedTrips,
  verifyTicket
};
