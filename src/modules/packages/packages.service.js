const repo = require("./packages.repository");
const prisma = require("../../config/prisma");
const { uploadBufferToFirebase } = require("../../utils/uploadToFirebase");

const includePackage = {
  include: {
    images: true,
    pickupPoints: true,
    dates: { include: { captain: { include: { user: true } } } }
  }
};

const normalizeStatus = (status) => status && String(status).toUpperCase();

const create = async (payload, files = []) => {
  const uploadedImages = [];
  for (const file of files) {
    uploadedImages.push(await uploadBufferToFirebase(file, "packages"));
  }

  return repo.create(
    {
      title: payload.title,
      description: payload.description,
      category: payload.category,
      location: payload.location,
      price: payload.price,
      offerPrice: payload.offerPrice,
      duration: payload.duration,
      seats: payload.seats,
      status: normalizeStatus(payload.status) || "ACTIVE",
      images: { create: uploadedImages },
      pickupPoints: {
        create: (payload.pickupPoints || []).map((location) => ({ location }))
      },
      dates: {
        create: (payload.tripDates || []).map((item) => ({
          tripDate: new Date(item.tripDate),
          seatsAvailable: item.seatsAvailable || payload.seats,
          captainId: item.captainId
        }))
      }
    },
    includePackage
  );
};

const list = () =>
  repo.findMany({
    ...includePackage,
    orderBy: { createdAt: "desc" }
  });

const get = (id) => repo.findUnique(id, includePackage);

const update = async (id, payload, files = []) => {
  const data = {
    title: payload.title,
    description: payload.description,
    category: payload.category,
    location: payload.location,
    price: payload.price,
    offerPrice: payload.offerPrice,
    duration: payload.duration,
    seats: payload.seats,
    status: normalizeStatus(payload.status)
  };

  Object.keys(data).forEach((key) => data[key] === undefined && delete data[key]);

  if (payload.pickupPoints) {
    await prisma.packagePickupPoint.deleteMany({ where: { packageId: id } });
    data.pickupPoints = { create: payload.pickupPoints.map((location) => ({ location })) };
  }

  if (payload.tripDates) {
    await prisma.packageDate.deleteMany({ where: { packageId: id } });
    data.dates = {
      create: payload.tripDates.map((item) => ({
        tripDate: new Date(item.tripDate),
        seatsAvailable: item.seatsAvailable || payload.seats || 0,
        captainId: item.captainId
      }))
    };
  }

  if (files.length) {
    const uploadedImages = [];
    for (const file of files) {
      uploadedImages.push(await uploadBufferToFirebase(file, "packages"));
    }
    data.images = { create: uploadedImages };
  }

  return repo.update(id, data, includePackage);
};

const remove = (id) => repo.delete(id);

const assignCaptain = (packageDateId, captainId) =>
  prisma.packageDate.update({
    where: { id: packageDateId },
    data: { captainId },
    include: { package: true, captain: { include: { user: true } } }
  });

module.exports = {
  create,
  list,
  get,
  update,
  remove,
  assignCaptain
};
