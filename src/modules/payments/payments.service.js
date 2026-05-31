const crypto = require("crypto");
const prisma = require("../../config/prisma");
const env = require("../../config/env");
const { getRazorpayClient } = require("../../config/razorpay");
const { AppError } = require("../../utils/errors");

const getBooking = async ({ bookingType, bookingId }) => {
  if (bookingType === "PACKAGE") return prisma.packageBooking.findUnique({ where: { id: bookingId } });
  if (bookingType === "HOTEL") return prisma.hotelBooking.findUnique({ where: { id: bookingId } });
  if (bookingType === "VEHICLE") return prisma.vehicleBooking.findUnique({ where: { id: bookingId } });
  throw new AppError("Invalid booking type.", 400);
};

const createOrder = async ({ bookingType, bookingId }) => {
  const booking = await getBooking({ bookingType, bookingId });
  if (!booking) throw new AppError("Booking not found.", 404);

  const razorpay = getRazorpayClient();
  const amount = Number(booking.totalAmount) * 100;
  const order = await razorpay.orders.create({
    amount,
    currency: "INR",
    receipt: booking.bookingCode
  });

  const data = {
    transactionId: order.id,
    razorpayOrderId: order.id,
    amount: booking.totalAmount,
    currency: "INR",
    status: "PENDING"
  };
  if (bookingType === "PACKAGE") data.packageBookingId = booking.id;
  if (bookingType === "HOTEL") data.hotelBookingId = booking.id;
  if (bookingType === "VEHICLE") data.vehicleBookingId = booking.id;

  const payment = await prisma.payment.create({ data });
  return { order, payment };
};

const verifyPayment = async ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
  const generatedSignature = crypto
    .createHmac("sha256", env.razorpayKeySecret || "")
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (generatedSignature !== razorpaySignature) {
    throw new AppError("Invalid Razorpay signature.", 400);
  }

  const payment = await prisma.payment.update({
    where: { razorpayOrderId },
    data: {
      razorpayPaymentId,
      status: "PAID"
    }
  });

  const bookingUpdate = { paymentStatus: "PAID", bookingStatus: "CONFIRMED" };
  if (payment.packageBookingId) await prisma.packageBooking.update({ where: { id: payment.packageBookingId }, data: bookingUpdate });
  if (payment.hotelBookingId) await prisma.hotelBooking.update({ where: { id: payment.hotelBookingId }, data: bookingUpdate });
  if (payment.vehicleBookingId) await prisma.vehicleBooking.update({ where: { id: payment.vehicleBookingId }, data: bookingUpdate });

  return payment;
};

const transactions = () => prisma.payment.findMany({ orderBy: { createdAt: "desc" }, include: { refunds: true } });

const createRefund = async ({ paymentId, amount }) => {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) throw new AppError("Payment not found.", 404);

  return prisma.refund.create({
    data: {
      paymentId,
      amount,
      status: "PENDING"
    }
  });
};

module.exports = {
  createOrder,
  verifyPayment,
  transactions,
  createRefund
};
