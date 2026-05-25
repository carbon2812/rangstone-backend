const { ensureFirebase } = require("../config/firebase");
const {
  createAndSendOtp,
  verifyStoredOtp,
  getFast2SmsWalletBalance,
  normalizePhone
} = require("../services/otpService");

const isValidPhone = (phone) => /^\d{10,15}$/.test(normalizePhone(phone));
const isValidOtp = (otp) => /^\d{4,8}$/.test(String(otp || ""));

const uidFromPhone = (phone) => `phone_${normalizePhone(phone)}`;

const sendOtp = async (req, res, next) => {
  try {
    const { phone } = req.body;

    if (!phone || !isValidPhone(phone)) {
      return res.status(400).json({
        success: false,
        message: "A valid phone number with 10 to 15 digits is required."
      });
    }

    await createAndSendOtp(phone);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully"
    });
  } catch (error) {
    return next(error);
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !isValidPhone(phone)) {
      return res.status(400).json({
        success: false,
        message: "A valid phone number with 10 to 15 digits is required."
      });
    }

    if (!otp || !isValidOtp(otp)) {
      return res.status(400).json({
        success: false,
        message: "A valid numeric OTP with 4 to 8 digits is required."
      });
    }

    const normalizedPhone = normalizePhone(phone);
    const uid = uidFromPhone(normalizedPhone);

    await verifyStoredOtp({ phone: normalizedPhone, otp });

    const { admin } = ensureFirebase();

    const firebaseToken = await admin.auth().createCustomToken(uid, {
      phone: normalizedPhone,
      role: "customer"
    });

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      firebaseToken,
      uid
    });
  } catch (error) {
    return next(error);
  }
};

const getWalletBalance = async (req, res, next) => {
  try {
    const wallet = await getFast2SmsWalletBalance();

    return res.status(200).json({
      success: true,
      message: "Fast2SMS wallet balance fetched successfully",
      wallet
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  sendOtp,
  verifyOtp,
  getWalletBalance
};
