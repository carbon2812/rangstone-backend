const Razorpay = require("razorpay");
const env = require("./env");

let client;

const getRazorpayClient = () => {
  if (!env.razorpayKeyId || !env.razorpayKeySecret) {
    const error = new Error("Razorpay credentials are not configured.");
    error.statusCode = 500;
    throw error;
  }

  if (!client) {
    client = new Razorpay({
      key_id: env.razorpayKeyId,
      key_secret: env.razorpayKeySecret
    });
  }

  return client;
};

module.exports = {
  getRazorpayClient
};
