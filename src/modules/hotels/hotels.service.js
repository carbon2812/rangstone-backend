const prisma = require("../../config/prisma");
const { uploadBufferToFirebase } = require("../../utils/uploadToFirebase");

const includeHotel = {
  include: {
    images: true,
    rooms: { include: { images: true } }
  }
};

const createHotel = async (ownerId, payload, files = []) => {
  const images = [];
  for (const file of files) images.push(await uploadBufferToFirebase(file, "hotels"));

  return prisma.hotel.create({
    data: {
      ownerId: payload.ownerId || ownerId,
      name: payload.name,
      description: payload.description,
      location: payload.location,
      rating: payload.rating,
      status: payload.status || "ACTIVE",
      images: { create: images }
    },
    ...includeHotel
  });
};

const updateHotel = async (id, payload, files = []) => {
  const data = { ...payload };
  delete data.ownerId;

  if (files.length) {
    const images = [];
    for (const file of files) images.push(await uploadBufferToFirebase(file, "hotels"));
    data.images = { create: images };
  }

  return prisma.hotel.update({
    where: { id },
    data,
    ...includeHotel
  });
};

const listHotels = () => prisma.hotel.findMany({ ...includeHotel, orderBy: { createdAt: "desc" } });
const getHotel = (id) => prisma.hotel.findUnique({ where: { id }, ...includeHotel });
const deleteHotel = (id) => prisma.hotel.delete({ where: { id } });

const addRoom = async (hotelId, payload, files = []) => {
  const images = [];
  for (const file of files) images.push(await uploadBufferToFirebase(file, "hotel-rooms"));

  return prisma.hotelRoom.create({
    data: {
      hotelId,
      roomType: payload.roomType,
      description: payload.description,
      price: payload.price,
      amenities: payload.amenities || [],
      availability: payload.availability ?? true,
      status: payload.status || "AVAILABLE",
      images: { create: images }
    },
    include: { images: true, hotel: true }
  });
};

const updateRoom = async (id, payload, files = []) => {
  const data = { ...payload };
  if (files.length) {
    const images = [];
    for (const file of files) images.push(await uploadBufferToFirebase(file, "hotel-rooms"));
    data.images = { create: images };
  }

  return prisma.hotelRoom.update({
    where: { id },
    data,
    include: { images: true, hotel: true }
  });
};

const deleteRoom = (id) => prisma.hotelRoom.delete({ where: { id } });

module.exports = {
  createHotel,
  updateHotel,
  listHotels,
  getHotel,
  deleteHotel,
  addRoom,
  updateRoom,
  deleteRoom
};
