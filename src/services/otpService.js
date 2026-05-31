const axios = require("axios");
const prisma = require("../config/prisma");
const env = require("../config/env");
const { randomDigits } = require("../utils/codeGenerator");
const { hashOtp } = require("../utils/otpGenerator");
const { AppError } = require("../utils/errors");

const normalizePhone = (phone) => String(phone || "").replace(/\D/g, "");

const getOtpExpiryDate = () => new Date(Date.now() + env.otpExpiryMinutes * 60 * 1000);

const ensureFast2SmsConfig = () => {
  const missing = [];
  if (!env.fast2SmsApiKey) missing.push("FAST2SMS_API_KEY");
  if (!env.messageId) missing.push("MESSAGE_ID");
  if (!env.phoneNumberId) missing.push("PHONE_NUMBER_ID");

  if (missing.length) {
    throw new AppError(`Missing Fast2SMS configuration: ${missing.join(", ")}`, 500);
  }
};

const sendOtpViaFast2Sms = async ({ phone, otp }) => {
  if (process.env.OTP_DELIVERY_MODE === "log") {
    console.log(`OTP for ${phone}: ${otp}`);
    return { mocked: true };
  }

  ensureFast2SmsConfig();

  const response = await axios.get(env.fast2SmsWhatsappApiUrl, {
    headers: {
      accept: "application/json"
    },
    params: {
      authorization: env.fast2SmsApiKey,
      message_id: env.messageId,
      phone_number_id: env.phoneNumberId,
      numbers: normalizePhone(phone),
      variables_values: otp
    },
    timeout: 15000
  });

  return response.data;
};

const getFast2SmsWalletBalance = async () => {
  if (!env.fast2SmsApiKey) {
    throw new AppError("Missing Fast2SMS configuration: FAST2SMS_API_KEY", 500);
  }

  const response = await axios.get("https://www.fast2sms.com/dev/wallet", {
    headers: {
      accept: "application/json"
    },
    params: {
      authorization: env.fast2SmsApiKey
    },
    timeout: 15000
  });

  return response.data;
};

const createAndSendOtp = async (phone) => {
  const phoneNumber = normalizePhone(phone);
  const otp = randomDigits(env.otpLength);

  await prisma.otpVerification.upsert({
    where: { phoneNumber },
    create: {
      phoneNumber,
      otpHash: hashOtp(otp),
      attempts: 0,
      expiresAt: getOtpExpiryDate()
    },
    update: {
      otpHash: hashOtp(otp),
      attempts: 0,
      expiresAt: getOtpExpiryDate()
    }
  });

  await sendOtpViaFast2Sms({ phone: phoneNumber, otp });
};

const verifyStoredOtp = async ({ phone, otp }) => {
  const phoneNumber = normalizePhone(phone);
  const record = await prisma.otpVerification.findUnique({
    where: { phoneNumber }
  });

  if (!record) {
    throw new AppError("OTP not found. Please request a new OTP.", 404);
  }

  if (record.expiresAt.getTime() < Date.now()) {
    await prisma.otpVerification.delete({ where: { phoneNumber } });
    throw new AppError("OTP expired. Please request a new OTP.", 401);
  }

  if (record.attempts >= env.otpMaxAttempts) {
    await prisma.otpVerification.delete({ where: { phoneNumber } });
    throw new AppError("Too many invalid attempts. Please request a new OTP.", 401);
  }

  if (record.otpHash !== hashOtp(otp)) {
    await prisma.otpVerification.update({
      where: { phoneNumber },
      data: { attempts: { increment: 1 } }
    });
    throw new AppError("Invalid OTP.", 401);
  }

  await prisma.otpVerification.delete({ where: { phoneNumber } });
  return true;
};

module.exports = {
  createAndSendOtp,
  verifyStoredOtp,
  getFast2SmsWalletBalance,
  normalizePhone
};
