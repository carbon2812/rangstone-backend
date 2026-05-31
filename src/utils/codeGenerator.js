const crypto = require("crypto");

const randomDigits = (length = 6) => {
  let value = "";
  for (let index = 0; index < length; index += 1) {
    value += crypto.randomInt(0, 10);
  }
  return value;
};

const bookingCode = (prefix) => `${prefix}-${Date.now()}-${crypto.randomInt(1000, 9999)}`;

const ticketNumber = () => `TKT-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

const referralCode = (name = "AGENT") =>
  `${String(name).replace(/[^a-z0-9]/gi, "").slice(0, 6).toUpperCase() || "AGENT"}${crypto
    .randomInt(1000, 9999)
    .toString()}`;

module.exports = {
  randomDigits,
  bookingCode,
  ticketNumber,
  referralCode
};
