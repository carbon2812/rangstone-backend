const axios = require("axios");
const { ensureFirebase } = require("../config/firebase");
const { generateOtp, hashOtp } = require("../utils/otpGenerator");

const normalizePhone = (phone) => String(phone || "").replace(/\D/g, "");

const buildOtpDocId = (phone) => `phone_${normalizePhone(phone)}`;

const getOtpExpiryDate = () => {
  const expiryMinutes = Number(process.env.OTP_EXPIRY_MINUTES) || 5;
  return new Date(Date.now() + expiryMinutes * 60 * 1000);
};

const ensureFast2SmsConfig = () => {
  const required = ["FAST2SMS_API_KEY", "MESSAGE_ID", "PHONE_NUMBER_ID"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length) {
    const error = new Error(`Missing Fast2SMS configuration: ${missing.join(", ")}`);
    error.statusCode = 500;
    throw error;
  }
};

const ensureFast2SmsApiKey = () => {
  if (!process.env.FAST2SMS_API_KEY) {
    const error = new Error("Missing Fast2SMS configuration: FAST2SMS_API_KEY");
    error.statusCode = 500;
    throw error;
  }
};

const sendOtpViaFast2Sms = async ({ phone, otp }) => {
  ensureFast2SmsConfig();

  const apiUrl = process.env.FAST2SMS_WHATSAPP_API_URL || "https://www.fast2sms.com/dev/whatsapp";
  const variables = { "1": otp };

  const response = await axios.get(apiUrl, {
    headers: {
      accept: "application/json"
    },
    params: {
      authorization: process.env.FAST2SMS_API_KEY,
      message_id: process.env.MESSAGE_ID,
      phone_number_id: process.env.PHONE_NUMBER_ID,
      numbers: normalizePhone(phone),
      variables_values: Object.values(variables).join("|")
    },
    timeout: 15000
  });

  return response.data;
};

const getFast2SmsWalletBalance = async () => {
  ensureFast2SmsApiKey();

  const response = await axios.get("https://www.fast2sms.com/dev/wallet", {
    headers: {
      accept: "application/json"
    },
    params: {
      authorization: process.env.FAST2SMS_API_KEY
    },
    timeout: 15000
  });

  return response.data;
};

const createAndSendOtp = async (phone) => {
  const { admin, db } = ensureFirebase();
  const otpCollection = db.collection("otp_verifications");
  const normalizedPhone = normalizePhone(phone);
  const otp = generateOtp();
  const expiresAt = getOtpExpiryDate();
  const docId = buildOtpDocId(normalizedPhone);

  await otpCollection.doc(docId).set({
    phone: normalizedPhone,
    otpHash: hashOtp(otp),
    expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
    attempts: 0,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  await sendOtpViaFast2Sms({ phone: normalizedPhone, otp });
};

const verifyStoredOtp = async ({ phone, otp }) => {
  const { admin, db } = ensureFirebase();
  const otpCollection = db.collection("otp_verifications");
  const normalizedPhone = normalizePhone(phone);
  const docRef = otpCollection.doc(buildOtpDocId(normalizedPhone));
  const doc = await docRef.get();

  if (!doc.exists) {
    const error = new Error("OTP not found. Please request a new OTP.");
    error.statusCode = 404;
    throw error;
  }

  const data = doc.data();
  const maxAttempts = Number(process.env.OTP_MAX_ATTEMPTS) || 5;

  if (data.expiresAt.toDate().getTime() < Date.now()) {
    await docRef.delete();
    const error = new Error("OTP expired. Please request a new OTP.");
    error.statusCode = 401;
    throw error;
  }

  if ((data.attempts || 0) >= maxAttempts) {
    await docRef.delete();
    const error = new Error("Too many invalid attempts. Please request a new OTP.");
    error.statusCode = 401;
    throw error;
  }

  if (data.otpHash !== hashOtp(otp)) {
    await docRef.update({
      attempts: admin.firestore.FieldValue.increment(1),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    const error = new Error("Invalid OTP.");
    error.statusCode = 401;
    throw error;
  }

  await docRef.delete();

  return true;
};

module.exports = {
  createAndSendOtp,
  verifyStoredOtp,
  getFast2SmsWalletBalance,
  normalizePhone,
  buildOtpDocId
};
