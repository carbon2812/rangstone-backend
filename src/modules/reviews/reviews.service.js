const prisma = require("../../config/prisma");

const create = (userId, payload) => {
  const data = {
    userId,
    rating: payload.rating,
    comment: payload.comment,
    targetType: payload.targetType
  };

  if (payload.targetType === "PACKAGE") data.packageId = payload.targetId;
  if (payload.targetType === "HOTEL") data.hotelId = payload.targetId;
  if (payload.targetType === "VEHICLE") data.vehicleId = payload.targetId;

  return prisma.review.create({ data });
};

const list = () =>
  prisma.review.findMany({
    where: { isHidden: false },
    include: { user: true, package: true, hotel: true, vehicle: true },
    orderBy: { createdAt: "desc" }
  });

const updateVisibility = (id, isHidden) =>
  prisma.review.update({
    where: { id },
    data: { isHidden }
  });

const remove = (id) => prisma.review.delete({ where: { id } });

module.exports = {
  create,
  list,
  updateVisibility,
  remove
};
