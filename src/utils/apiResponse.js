const success = (res, message, data = {}, statusCode = 200) =>
  res.status(statusCode).json({
    success: true,
    message,
    data
  });

module.exports = {
  success
};
