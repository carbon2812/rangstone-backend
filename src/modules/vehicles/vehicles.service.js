const prisma = require("../../config/prisma");
const { uploadBufferToFirebase } = require("../../utils/uploadToFirebase");

const includeVehicle = {
  include: {
    images: true,
    vendor: true
  }
};

const create = async (vendorId, payload, files = []) => {
  const images = [];
  for (const file of files) images.push(await uploadBufferToFirebase(file, "vehicles"));

  return prisma.vehicle.create({
    data: {
      vendorId: payload.vendorId || vendorId,
      type: payload.type,
      brand: payload.brand,
      model: payload.model,
      registrationNumber: payload.registrationNumber,
      fuelType: payload.fuelType,
      seatingCapacity: payload.seatingCapacity,
      pricePerHour: payload.pricePerHour,
      pricePerDay: payload.pricePerDay,
      securityDeposit: payload.securityDeposit,
      pickupLocation: payload.pickupLocation,
      dropLocation: payload.dropLocation,
      withDriver: payload.withDriver || false,
      selfDrive: payload.selfDrive ?? true,
      availability: payload.availability || "AVAILABLE",
      images: { create: images }
    },
    ...includeVehicle
  });
};

const list = () => prisma.vehicle.findMany({ ...includeVehicle, orderBy: { createdAt: "desc" } });
const get = (id) => prisma.vehicle.findUnique({ where: { id }, ...includeVehicle });

const update = async (id, payload, files = []) => {
  const data = { ...payload };
  delete data.vendorId;

  if (files.length) {
    const images = [];
    for (const file of files) images.push(await uploadBufferToFirebase(file, "vehicles"));
    data.images = { create: images };
  }

  return prisma.vehicle.update({
    where: { id },
    data,
    ...includeVehicle
  });
};

const remove = (id) => prisma.vehicle.delete({ where: { id } });

module.exports = {
  create,
  list,
  get,
  update,
  remove
};
