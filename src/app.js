const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const swaggerUi = require("swagger-ui-express");
const env = require("./config/env");
const swaggerDocument = require("./swagger/swagger");
const { getFirebaseStorageStatus } = require("./config/firebaseStorage");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");
const { apiLimiter } = require("./middlewares/rateLimitMiddleware");

const authRoutes = require("./modules/auth/auth.routes");
const userRoutes = require("./modules/users/users.routes");
const packageRoutes = require("./modules/packages/packages.routes");
const bookingRoutes = require("./modules/bookings/bookings.routes");
const captainRoutes = require("./modules/captains/captains.routes");
const agentRoutes = require("./modules/agents/agents.routes");
const hotelRoutes = require("./modules/hotels/hotels.routes");
const vehicleRoutes = require("./modules/vehicles/vehicles.routes");
const paymentRoutes = require("./modules/payments/payments.routes");
const reviewRoutes = require("./modules/reviews/reviews.routes");
const dashboardRoutes = require("./modules/dashboard/dashboard.routes");
const adminAgentRoutes = require("./modules/agentManagement/adminAgents.routes");
const agentPortalRoutes = require("./modules/agentManagement/agentPortal.routes");

const app = express();

if (env.trustProxy) {
  app.set("trust proxy", 1);
}

app.use(helmet());
app.use(cors({ origin: env.corsOrigin === "*" ? "*" : env.corsOrigin.split(",") }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    data: {
      firebaseStorage: getFirebaseStorageStatus()
    }
  });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/api", apiLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/packages", packageRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/captains", captainRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", adminAgentRoutes);
app.use("/api/agent", agentPortalRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
