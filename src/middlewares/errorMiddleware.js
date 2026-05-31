const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const errorHandler = (error, req, res, next) => {
  const statusCode = error.statusCode || error.status || 500;
  const isProduction = process.env.NODE_ENV === "production";

  if (!isProduction) {
    console.error(error);
  }

  return res.status(statusCode).json({
    success: false,
    message: error.message || "Internal server error",
    ...(isProduction ? {} : { stack: error.stack })
  });
};

module.exports = {
  notFound,
  errorHandler
};
